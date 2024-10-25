import { z } from "zod";
import {
  CodeGeneratorToolConfig,
  DEFAULT_CODE_GENERATOR_TOOL_CONFIG,
} from "./tools/code_generator";
import {
  DEFAULT_DOCUMENT_GENERATOR_TOOL_CONFIG,
  DocumentGeneratorToolConfig,
} from "./tools/document_generator";
import {
  DEFAULT_DUCKDUCKGO_TOOL_CONFIG,
  DuckDuckGoToolConfig,
} from "./tools/duckduckgo";
import {
  DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG,
  ImageGeneratorToolConfig,
} from "./tools/image_generator";
import {
  DEFAULT_E2B_INTERPRETER_TOOL_CONFIG,
  E2BInterpreterToolConfig,
} from "./tools/interpreter";
import {
  DEFAULT_OPENAPI_TOOL_CONFIG,
  OpenAPIToolConfig,
} from "./tools/openapi";
import {
  DEFAULT_QUERY_ENGINE_TOOL_CONFIG,
  QueryEngineToolConfig,
} from "./tools/query_engine";
import {
  DEFAULT_WIKIPEDIA_TOOL_CONFIG,
  WikipediaToolConfig,
} from "./tools/wikipedia";
import { getBaseURL } from "./utils";

// Define the tools schema
export const ToolsSchema = z.object({
  ImageGenerator: ImageGeneratorToolConfig,
  OpenAPI: OpenAPIToolConfig,
  Interpreter: E2BInterpreterToolConfig,
  DuckDuckGo: DuckDuckGoToolConfig,
  Wikipedia: WikipediaToolConfig,
  QueryEngine: QueryEngineToolConfig,
  CodeGenerator: CodeGeneratorToolConfig,
  DocumentGenerator: DocumentGeneratorToolConfig,
});

// Define the agent config schema
export const AgentConfigSchema = z.object({
  agent_id: z.string(),
  name: z.string(),
  role: z.string().trim().min(1, {
    message: "Role is required to select the right agent for a task.",
  }),
  goal: z.string().min(1, {
    message: "Goal is required to select the right agent for a task.",
  }),
  backstory: z.string().nullable(),
  system_prompt: z.string().nullable(),
  tools: ToolsSchema,
  created_at: z.number(),
});

export type ToolConfigType = z.infer<typeof ToolsSchema>[keyof z.infer<
  typeof ToolsSchema
>];

export type AgentConfigType = z.infer<typeof AgentConfigSchema>;

// Define default configurations
export const DEFAULT_TOOL_CONFIG: z.infer<typeof ToolsSchema> = {
  ImageGenerator: DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG,
  OpenAPI: DEFAULT_OPENAPI_TOOL_CONFIG,
  Interpreter: DEFAULT_E2B_INTERPRETER_TOOL_CONFIG,
  DuckDuckGo: DEFAULT_DUCKDUCKGO_TOOL_CONFIG,
  Wikipedia: DEFAULT_WIKIPEDIA_TOOL_CONFIG,
  QueryEngine: DEFAULT_QUERY_ENGINE_TOOL_CONFIG,
  CodeGenerator: DEFAULT_CODE_GENERATOR_TOOL_CONFIG,
  DocumentGenerator: DEFAULT_DOCUMENT_GENERATOR_TOOL_CONFIG,
};

export const DEFAULT_AGENT_CONFIG_SYSTEM_PROMPT_TEMPLATE =
  "You are {role}. {backstory}\nYour personal goal is: {goal}";

export const DEFAULT_AGENT_CONFIG: Omit<AgentConfigType, "agent_id"> = {
  name: "New Agent",
  role: "General Assistant",
  backstory:
    "You are a versatile AI assistant designed to help with various tasks.",
  goal: "Assist users with their queries and provide helpful information.",
  tools: DEFAULT_TOOL_CONFIG,
  system_prompt: null,
  created_at: Math.floor(Date.now() / 1000),
};

// API functions
export async function getAgents(): Promise<AgentConfigType[]> {
  const res = await fetch(`${getBaseURL()}/api/management/agents`);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return await res.json();
}

export async function createAgent(
  data: AgentConfigType,
): Promise<AgentConfigType> {
  const res = await fetch(`${getBaseURL()}/api/management/agents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return await res.json();
}

export async function updateAgent(
  agentId: string,
  data: AgentConfigType,
): Promise<AgentConfigType> {
  const res = await fetch(`${getBaseURL()}/api/management/agents/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return await res.json();
}

export async function deleteAgent(agentId: string): Promise<void> {
  const res = await fetch(`${getBaseURL()}/api/management/agents/${agentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
}

export const checkSupportedModel = async (): Promise<boolean> => {
  const res = await fetch(
    `${getBaseURL()}/api/management/agents/check_supported_model`,
  );
  if (!res.ok) {
    throw new Error("Failed to check model support");
  }
  return res.json();
};

export async function getAgentTemplates(): Promise<AgentConfigType[]> {
  const res = await fetch(`${getBaseURL()}/api/management/agents/templates`);
  if (!res.ok) {
    throw new Error("Failed to get agent templates");
  }
  return await res.json();
}
