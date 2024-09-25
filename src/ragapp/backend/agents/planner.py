# Copied from: https://github.com/run-llama/create-llama/blob/b31fa80326400bfb94c95de2ffff7c31a8bf9eba/templates/types/multiagent/fastapi/app/agents/planner.py
import uuid
from enum import Enum
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple, Union

from llama_index.core.agent.runner.planner import (
    DEFAULT_INITIAL_PLAN_PROMPT,
    DEFAULT_PLAN_REFINE_PROMPT,
    Plan,
    PlannerAgentState,
    SubTask,
)
from llama_index.core.bridge.pydantic import ValidationError
from llama_index.core.llms.function_calling import FunctionCallingLLM
from llama_index.core.prompts import PromptTemplate
from llama_index.core.settings import Settings
from llama_index.core.tools import BaseTool
from llama_index.core.workflow import (
    Context,
    Event,
    StartEvent,
    StopEvent,
    Workflow,
    step,
)

from backend.agents.single import AgentRunEvent, AgentRunResult, FunctionCallingAgent


class ExecutePlanEvent(Event):
    pass


class SubTaskEvent(Event):
    sub_task: SubTask


class SubTaskResultEvent(Event):
    sub_task: SubTask
    result: AgentRunResult | AsyncGenerator


class PlanEventType(Enum):
    CREATED = "created"
    REFINED = "refined"


class PlanEvent(AgentRunEvent):
    event_type: PlanEventType
    plan: Plan

    @property
    def msg(self) -> str:
        sub_task_names = ", ".join(task.name for task in self.plan.sub_tasks)
        return f"Plan {self.event_type.value}: Let's do: {sub_task_names}"


class StructuredPlannerAgent(Workflow):
    def __init__(
        self,
        *args: Any,
        name: str,
        llm: FunctionCallingLLM | None = None,
        tools: List[BaseTool] | None = None,
        timeout: float = 360.0,
        refine_plan: bool = False,
        **kwargs: Any,
    ) -> None:
        super().__init__(*args, timeout=timeout, **kwargs)
        self.name = name
        self.refine_plan = refine_plan

        self.tools = tools or []
        self.planner = Planner(llm=llm, tools=self.tools, verbose=self._verbose)
        # The executor is keeping the memory of all tool calls and decides to call the right tool for the task
        self.executor = FunctionCallingAgent(
            name="executor",
            llm=llm,
            tools=self.tools,
            write_events=False,
            # it's important to instruct to just return the tool call, otherwise the executor will interpret and change the result
            system_prompt="You are an expert in completing given tasks by calling the right tool for the task. Just return the result of the tool call. Don't add any information yourself",
        )
        self.add_workflows(executor=self.executor)

    @step()
    async def create_plan(
        self, ctx: Context, ev: StartEvent
    ) -> ExecutePlanEvent | StopEvent:
        # set streaming
        ctx.data["streaming"] = getattr(ev, "streaming", False)
        ctx.data["task"] = ev.input

        plan_id, plan = await self.planner.create_plan(input=ev.input)
        ctx.data["act_plan_id"] = plan_id

        # inform about the new plan
        ctx.write_event_to_stream(
            PlanEvent(name=self.name, event_type=PlanEventType.CREATED, plan=plan)
        )
        if self._verbose:
            print("=== Executing plan ===\n")
        return ExecutePlanEvent()

    @step()
    async def execute_plan(self, ctx: Context, ev: ExecutePlanEvent) -> SubTaskEvent:
        upcoming_sub_tasks = self.planner.state.get_next_sub_tasks(
            ctx.data["act_plan_id"]
        )

        ctx.data["num_sub_tasks"] = len(upcoming_sub_tasks)
        # send an event per sub task
        events = [SubTaskEvent(sub_task=sub_task) for sub_task in upcoming_sub_tasks]
        for event in events:
            ctx.send_event(event)

        return None

    @step()
    async def execute_sub_task(
        self, ctx: Context, ev: SubTaskEvent
    ) -> SubTaskResultEvent:
        if self._verbose:
            print(f"=== Executing sub task: {ev.sub_task.name} ===")
        is_last_tasks = ctx.data["num_sub_tasks"] == self.get_remaining_subtasks(ctx)
        # TODO: streaming only works without plan refining
        streaming = is_last_tasks and ctx.data["streaming"] and not self.refine_plan
        handler = self.executor.run(
            input=ev.sub_task.input,
            streaming=streaming,
            return_tool_output=True,
        )
        # bubble all events while running the executor to the planner
        async for event in handler.stream_events():
            # Don't write StopEvent to stream
            if type(event) is not StopEvent:
                ctx.write_event_to_stream(event)
        result = await handler
        if self._verbose:
            print("=== Done executing sub task ===\n")
        self.planner.state.add_completed_sub_task(ctx.data["act_plan_id"], ev.sub_task)
        return SubTaskResultEvent(sub_task=ev.sub_task, result=result)

    @step()
    async def gather_results(
        self, ctx: Context, ev: SubTaskResultEvent
    ) -> ExecutePlanEvent | StopEvent:
        # wait for all sub tasks to finish
        num_sub_tasks = ctx.data["num_sub_tasks"]
        results = ctx.collect_events(ev, [SubTaskResultEvent] * num_sub_tasks)
        if results is None:
            return None

        upcoming_sub_tasks = self.get_upcoming_sub_tasks(ctx)
        # if no more tasks to do, stop workflow and send result of last step
        if upcoming_sub_tasks == 0:
            return StopEvent(result=results[-1].result)

        if self.refine_plan:
            # store all results for refining the plan
            ctx.data["results"] = ctx.data.get("results", {})
            for result in results:
                ctx.data["results"][result.sub_task.name] = result.result

            new_plan = await self.planner.refine_plan(
                ctx.data["task"], ctx.data["act_plan_id"], ctx.data["results"]
            )
            # inform about the new plan
            if new_plan is not None:
                ctx.write_event_to_stream(
                    PlanEvent(
                        name=self.name, event_type=PlanEventType.REFINED, plan=new_plan
                    )
                )

        # continue executing plan
        return ExecutePlanEvent()

    def get_upcoming_sub_tasks(self, ctx: Context):
        upcoming_sub_tasks = self.planner.state.get_next_sub_tasks(
            ctx.data["act_plan_id"]
        )
        return len(upcoming_sub_tasks)

    def get_remaining_subtasks(self, ctx: Context):
        remaining_subtasks = self.planner.state.get_remaining_subtasks(
            ctx.data["act_plan_id"]
        )
        return len(remaining_subtasks)


# Concern dealing with creating and refining a plan, extracted from https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/agent/runner/planner.py#L138
class Planner:
    def __init__(
        self,
        llm: FunctionCallingLLM | None = None,
        tools: List[BaseTool] | None = None,
        initial_plan_prompt: Union[str, PromptTemplate] = DEFAULT_INITIAL_PLAN_PROMPT,
        plan_refine_prompt: Union[str, PromptTemplate] = DEFAULT_PLAN_REFINE_PROMPT,
        verbose: bool = True,
    ) -> None:
        if llm is None:
            llm = Settings.llm
        self.llm = llm
        # assert self.llm.metadata.is_function_calling_model

        self.tools = tools or []
        self.state = PlannerAgentState()
        self.verbose = verbose

        if isinstance(initial_plan_prompt, str):
            initial_plan_prompt = PromptTemplate(initial_plan_prompt)
        self.initial_plan_prompt = initial_plan_prompt

        if isinstance(plan_refine_prompt, str):
            plan_refine_prompt = PromptTemplate(plan_refine_prompt)
        self.plan_refine_prompt = plan_refine_prompt

    async def create_plan(self, input: str) -> Tuple[str, Plan]:
        tools = self.tools
        tools_str = ""
        for tool in tools:
            tools_str += tool.metadata.name + ": " + tool.metadata.description + "\n"

        try:
            plan = await self.llm.astructured_predict(
                Plan,
                self.initial_plan_prompt,
                tools_str=tools_str,
                task=input,
            )
        except (ValueError, ValidationError):
            if self.verbose:
                print("No complex plan predicted. Defaulting to a single task plan.")
            plan = Plan(
                sub_tasks=[
                    SubTask(
                        name="default", input=input, expected_output="", dependencies=[]
                    )
                ]
            )

        if self.verbose:
            print("=== Initial plan ===")
            for sub_task in plan.sub_tasks:
                print(
                    f"{sub_task.name}:\n{sub_task.input} -> {sub_task.expected_output}\ndeps: {sub_task.dependencies}\n\n"
                )

        plan_id = str(uuid.uuid4())
        self.state.plan_dict[plan_id] = plan

        return plan_id, plan

    async def refine_plan(
        self,
        input: str,
        plan_id: str,
        completed_sub_tasks: Dict[str, str],
    ) -> Optional[Plan]:
        """Refine a plan."""
        prompt_args = self.get_refine_plan_prompt_kwargs(
            plan_id, input, completed_sub_tasks
        )

        try:
            new_plan = await self.llm.astructured_predict(
                Plan, self.plan_refine_prompt, **prompt_args
            )

            self._update_plan(plan_id, new_plan)

            return new_plan
        except (ValueError, ValidationError) as e:
            # likely no new plan predicted
            if self.verbose:
                print(f"No new plan predicted: {e}")
            return None

    def _update_plan(self, plan_id: str, new_plan: Plan) -> None:
        """Update the plan."""
        # update state with new plan
        self.state.plan_dict[plan_id] = new_plan

        if self.verbose:
            print("=== Refined plan ===")
            for sub_task in new_plan.sub_tasks:
                print(
                    f"{sub_task.name}:\n{sub_task.input} -> {sub_task.expected_output}\ndeps: {sub_task.dependencies}\n\n"
                )

    def get_refine_plan_prompt_kwargs(
        self,
        plan_id: str,
        task: str,
        completed_sub_task: Dict[str, str],
    ) -> dict:
        """Get the refine plan prompt."""
        # gather completed sub-tasks and response pairs
        completed_outputs_str = ""
        for sub_task_name, task_output in completed_sub_task.items():
            task_str = f"{sub_task_name}:\n" f"\t{task_output!s}\n"
            completed_outputs_str += task_str

        # get a string for the remaining sub-tasks
        remaining_sub_tasks = self.state.get_remaining_subtasks(plan_id)
        remaining_sub_tasks_str = "" if len(remaining_sub_tasks) != 0 else "None"
        for sub_task in remaining_sub_tasks:
            task_str = (
                f"SubTask(name='{sub_task.name}', "
                f"input='{sub_task.input}', "
                f"expected_output='{sub_task.expected_output}', "
                f"dependencies='{sub_task.dependencies}')\n"
            )
            remaining_sub_tasks_str += task_str

        # get the tools string
        tools = self.tools
        tools_str = ""
        for tool in tools:
            tools_str += tool.metadata.name + ": " + tool.metadata.description + "\n"

        # return the kwargs
        return {
            "tools_str": tools_str.strip(),
            "task": task.strip(),
            "completed_outputs": completed_outputs_str.strip(),
            "remaining_sub_tasks": remaining_sub_tasks_str.strip(),
        }
