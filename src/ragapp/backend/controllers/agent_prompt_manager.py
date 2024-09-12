from typing import List

from backend.models.agent import AgentConfig


class AgentPromptManager:
    @staticmethod
    def get_tool_custom_prompts(agent: AgentConfig) -> str:
        tool_custom_prompts = ""
        for tool_name, tool_config in agent.tools.items():
            if tool_config.enabled and tool_config.custom_prompt:
                tool_custom_prompts += f"\n==={tool_name}===\n{tool_config.custom_prompt}\n==={tool_name}==="
        return tool_custom_prompts

    @classmethod
    def generate_agent_system_prompt(cls, agent: AgentConfig) -> str:
        base_prompt = agent.system_prompt
        tool_custom_prompts = cls.get_tool_custom_prompts(agent)

        if tool_custom_prompts:
            return f"{base_prompt}\n\nYou have access to the following tools:\n{tool_custom_prompts}"
        else:
            return base_prompt

    @classmethod
    def update_agent_system_prompts(cls, agents: List[AgentConfig]):
        for agent in agents:
            agent.system_prompt = cls.generate_agent_system_prompt(agent)
