from typing import List, Dict, Tuple
from backend.models.agent import AgentConfig
from backend.controllers.tools import tools_manager


class AgentPromptManager:
    @staticmethod
    def get_tool_custom_prompts(tools: List[Tuple[str, object]]) -> str:
        tool_custom_prompts = ""
        for tool_name, tool in tools:
            if hasattr(tool, "custom_prompt") and getattr(tool, "enabled", False):
                tool_custom_prompts += (
                    f"\n==={tool_name}===\n{tool.custom_prompt}\n==={tool_name}==="
                )
        return tool_custom_prompts

    @classmethod
    def generate_agent_system_prompt(cls, agent: AgentConfig) -> str:
        base_prompt = agent.system_prompt
        tools = tools_manager().get_tools()
        agent_tools = [
            (tool_name, tool)
            for tool_name, tool in tools
            if tool_name in agent.tools and agent.tools[tool_name].enabled
        ]

        tool_custom_prompts = cls.get_tool_custom_prompts(agent_tools)

        if tool_custom_prompts:
            return f"{base_prompt}\n\nYou have access to the following tools:\n{tool_custom_prompts}"
        else:
            return base_prompt

    @classmethod
    def update_agent_system_prompts(cls, agents: List[AgentConfig]):
        for agent in agents:
            updated_prompt = cls.generate_agent_system_prompt(agent)
            print(f"Updating system prompt for agent: {agent.name}")
            print(f"New system prompt: {updated_prompt}")
            # Here you would typically update the agent's system prompt in your database or configuration
            # For now, we'll just print it
