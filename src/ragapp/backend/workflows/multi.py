# Copied from: https://github.com/run-llama/create-llama/blob/c5559d8e593426e080d847b158e0b49d770473e2/templates/components/multiagent/python/app/workflows/multi.py
from typing import Any, List

from llama_index.core.tools.types import ToolMetadata, ToolOutput
from llama_index.core.tools.utils import create_schema_from_function
from llama_index.core.workflow import Context, Workflow
from llama_index.core.workflow.events import StopEvent

from backend.workflows.planner import StructuredPlannerAgent
from backend.workflows.single import (
    AgentRunResult,
    ContextAwareTool,
    FunctionCallingAgent,
)


class AgentCallTool(ContextAwareTool):
    def __init__(self, agent: Workflow) -> None:
        self.agent = agent
        name = f"call_{agent.name}"

        async def schema_call(input: str) -> str:
            pass

        # create the schema without the Context
        fn_schema = create_schema_from_function(name, schema_call)
        self._metadata = ToolMetadata(
            name=name,
            description=(
                f"Use this tool to delegate a sub task to the {agent.name} agent."
                + (
                    f" The agent is an {agent.description}."
                    if agent.description
                    else ""
                )
            ),
            fn_schema=fn_schema,
        )

    # overload the acall function with the ctx argument as it's needed for bubbling the events
    async def acall(self, ctx: Context, input: str) -> ToolOutput:
        handler = self.agent.run(input=input)
        # bubble all events while running the agent to the calling agent
        async for ev in handler.stream_events():
            if type(ev) is not StopEvent:
                ctx.write_event_to_stream(ev)
        ret: AgentRunResult = await handler
        response = ret.response.message.content
        return ToolOutput(
            content=str(response),
            tool_name=self.metadata.name,
            raw_input={"args": input, "kwargs": {}},
            raw_output=response,
        )


class AgentOrchestrator(StructuredPlannerAgent):
    def __init__(
        self,
        *args: Any,
        name: str = "orchestrator",
        agents: List[FunctionCallingAgent] | None = None,
        **kwargs: Any,
    ) -> None:
        agents = agents or []
        tools = [AgentCallTool(agent=agent) for agent in agents]
        super().__init__(
            *args,
            name=name,
            tools=tools,
            **kwargs,
        )
        # call add_workflows so agents will get detected by llama agents automatically
        self.add_workflows(**{agent.name: agent for agent in agents})
