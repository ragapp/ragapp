from string import Template

ENV_FILE_PATH = "config/.env"
TOOL_CONFIG_FILE = "config/tools.yaml"
LOADER_CONFIG_FILE = "config/loaders.yaml"


DEFAULT_SYSTEM_PROMPT = (
    "You are a helpful assistant who helps users with their questions."
)

SYSTEM_PROMPT_WITH_TOOLS_TPL = """
$system_prompt
You have access to tools that can help you answer questions.
Please follow the instructions below to use the tools correctly.$tool_custom_prompts
"""
