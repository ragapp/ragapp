from typing import Dict

from backend.models.agent import AgentConfig


class AgentPromptManager:
    @staticmethod
    def _get_tool_custom_prompts(agent: AgentConfig) -> str:
        tool_custom_prompts = ""
        for tool_name, tool_config in agent.tools.items():
            if tool_config.enabled and tool_config.custom_prompt:
                tool_custom_prompts += f"\n==={tool_name}===\n{tool_config.custom_prompt}\n==={tool_name}==="
        return tool_custom_prompts

    @classmethod
    def generate_agent_system_prompt(cls, agent: AgentConfig | Dict) -> str:
        if isinstance(agent, Dict):
            agent = AgentConfig(**agent)
        base_prompt = agent.get_system_prompt()
        tool_custom_prompts = cls._get_tool_custom_prompts(agent)

        if tool_custom_prompts:
            return f"{base_prompt}\n\nYou have access to the following tools:\n{tool_custom_prompts}"
        else:
            return base_prompt
