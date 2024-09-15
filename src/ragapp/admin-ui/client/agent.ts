import { z } from "zod";
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
});

// Define the agent config schema
export const AgentConfigSchema = z.object({
  agent_id: z.string(),
  name: z.string(),
  role: z.string(),
  system_prompt: z.string(),
  tools: ToolsSchema,
  created_at: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
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
};

export const DEFAULT_AGENT_CONFIG: Omit<AgentConfigType, "agent_id"> = {
  name: "New Agent",
  role: "",
  system_prompt: "You are a helpful assistant.",
  tools: DEFAULT_TOOL_CONFIG,
  created_at: new Date(),
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
  data: Omit<AgentConfigType, "agent_id">,
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
  data: Omit<AgentConfigType, "agent_id">,
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
