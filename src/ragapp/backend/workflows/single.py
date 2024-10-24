# Copied from: https://github.com/run-llama/create-llama/blob/c5559d8e593426e080d847b158e0b49d770473e2/templates/components/multiagent/python/app/workflows/single.py
from abc import abstractmethod
from typing import Any, AsyncGenerator, List, Optional

from llama_index.core.llms import ChatMessage, ChatResponse
from llama_index.core.llms.function_calling import FunctionCallingLLM
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.settings import Settings
from llama_index.core.tools import FunctionTool, ToolOutput, ToolSelection
from llama_index.core.tools.types import BaseTool
from llama_index.core.workflow import (
    Context,
    Event,
    StartEvent,
    StopEvent,
    Workflow,
    step,
)
from pydantic import BaseModel


class InputEvent(Event):
    input: list[ChatMessage]


class ToolCallEvent(Event):
    tool_calls: list[ToolSelection]


class AgentRunEvent(Event):
    name: str
    _msg: str

    @property
    def msg(self):
        return self._msg

    @msg.setter
    def msg(self, value):
        self._msg = value


class AgentRunResult(BaseModel):
    response: ChatResponse
    sources: list[ToolOutput]


class ContextAwareTool(FunctionTool):
    @abstractmethod
    async def acall(self, ctx: Context, input: Any) -> ToolOutput:
        pass


class FunctionCallingAgent(Workflow):
    def __init__(
        self,
        *args: Any,
        llm: FunctionCallingLLM | None = None,
        chat_history: Optional[List[ChatMessage]] = None,
        tools: List[BaseTool] | None = None,
        system_prompt: str | None = None,
        verbose: bool = False,
        timeout: float = 360.0,
        name: str,
        write_events: bool = True,
        description: str | None = None,
        **kwargs: Any,
    ) -> None:
        super().__init__(*args, verbose=verbose, timeout=timeout, **kwargs)
        self.tools = tools or []
        self.name = name
        self.write_events = write_events
        self.description = description

        if llm is None:
            llm = Settings.llm
        self.llm = llm
        assert self.llm.metadata.is_function_calling_model

        self.system_prompt = system_prompt

        self.memory = ChatMemoryBuffer.from_defaults(
            llm=self.llm, chat_history=chat_history
        )
        self.sources = []

    @step()
    async def prepare_chat_history(self, ctx: Context, ev: StartEvent) -> InputEvent:
        # clear sources
        self.sources = []

        # set system prompt
        if self.system_prompt is not None:
            system_msg = ChatMessage(role="system", content=self.system_prompt)
            self.memory.put(system_msg)

        # set streaming
        ctx.data["streaming"] = getattr(ev, "streaming", False)

        # get user input
        user_input = ev.input
        user_msg = ChatMessage(role="user", content=user_input)
        self.memory.put(user_msg)
        if self.write_events:
            ctx.write_event_to_stream(
                AgentRunEvent(name=self.name, msg=f"Start to work on: {user_input}")
            )

        # get chat history
        chat_history = self.memory.get()
        return InputEvent(input=chat_history)

    @step()
    async def handle_llm_input(
        self, ctx: Context, ev: InputEvent
    ) -> ToolCallEvent | StopEvent:
        if ctx.data["streaming"]:
            return await self.handle_llm_input_stream(ctx, ev)

        chat_history = ev.input

        response = await self.llm.achat_with_tools(
            self.tools, chat_history=chat_history
        )
        self.memory.put(response.message)

        tool_calls = self.llm.get_tool_calls_from_response(
            response, error_on_no_tool_call=False
        )

        if not tool_calls:
            if self.write_events:
                ctx.write_event_to_stream(
                    AgentRunEvent(name=self.name, msg="Finished task")
                )
            return StopEvent(
                result=AgentRunResult(response=response, sources=[*self.sources])
            )
        else:
            return ToolCallEvent(tool_calls=tool_calls)

    async def handle_llm_input_stream(
        self, ctx: Context, ev: InputEvent
    ) -> ToolCallEvent | StopEvent:
        chat_history = ev.input

        async def response_generator() -> AsyncGenerator:
            response_stream = await self.llm.astream_chat_with_tools(
                self.tools, chat_history=chat_history
            )

            full_response = None
            yielded_indicator = False
            async for chunk in response_stream:
                if "tool_calls" not in chunk.message.additional_kwargs:
                    # Yield a boolean to indicate whether the response is a tool call
                    if not yielded_indicator:
                        yield False
                        yielded_indicator = True

                    # if not a tool call, yield the chunks!
                    yield chunk
                elif not yielded_indicator:
                    # Yield the indicator for a tool call
                    yield True
                    yielded_indicator = True

                full_response = chunk

            # Write the full response to memory
            self.memory.put(full_response.message)

            # Yield the final response
            yield full_response

        # Start the generator
        generator = response_generator()

        # Check for immediate tool call
        is_tool_call = await generator.__anext__()
        if is_tool_call:
            full_response = await generator.__anext__()
            tool_calls = self.llm.get_tool_calls_from_response(full_response)
            return ToolCallEvent(tool_calls=tool_calls)

        # If we've reached here, it's not an immediate tool call, so we return the generator
        if self.write_events:
            ctx.write_event_to_stream(
                AgentRunEvent(name=self.name, msg="Finished task")
            )
        return StopEvent(result=generator)

    @step()
    async def handle_tool_calls(self, ctx: Context, ev: ToolCallEvent) -> InputEvent:
        tool_calls = ev.tool_calls
        tools_by_name = {tool.metadata.get_name(): tool for tool in self.tools}

        tool_msgs = []

        # call tools -- safely!
        for tool_call in tool_calls:
            tool = tools_by_name.get(tool_call.tool_name)
            additional_kwargs = {
                "tool_call_id": tool_call.tool_id,
                "name": tool.metadata.get_name(),
            }
            if not tool:
                tool_msgs.append(
                    ChatMessage(
                        role="tool",
                        content=f"Tool {tool_call.tool_name} does not exist",
                        additional_kwargs=additional_kwargs,
                    )
                )
                continue

            try:
                if isinstance(tool, ContextAwareTool):
                    # inject context for calling an context aware tool
                    tool_output = await tool.acall(ctx=ctx, **tool_call.tool_kwargs)
                else:
                    tool_output = await tool.acall(**tool_call.tool_kwargs)
                self.sources.append(tool_output)
                tool_msgs.append(
                    ChatMessage(
                        role="tool",
                        content=tool_output.content,
                        additional_kwargs=additional_kwargs,
                    )
                )
            except Exception as e:
                tool_msgs.append(
                    ChatMessage(
                        role="tool",
                        content=f"Encountered error in tool call: {e}",
                        additional_kwargs=additional_kwargs,
                    )
                )

        for msg in tool_msgs:
            self.memory.put(msg)

        chat_history = self.memory.get()
        return InputEvent(input=chat_history)
