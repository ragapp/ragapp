import { z } from "zod";
import {
  DEFAULT_DUCKDUCKGO_TOOL_CONFIG,
  DuckDuckGoToolConfigType,
} from "./tools/duckduckgo";
import {
  DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG,
  ImageGeneratorToolConfigType,
} from "./tools/image_generator";
import {
  DEFAULT_E2B_INTERPRETER_TOOL_CONFIG,
  E2BInterpreterToolConfigType,
} from "./tools/interpreter";
import {
  DEFAULT_OPENAPI_TOOL_CONFIG,
  OpenAPIToolConfigType,
} from "./tools/openapi";
import {
  DEFAULT_QUERY_ENGINE_TOOL_CONFIG,
  QueryEngineToolConfigType,
} from "./tools/query_engine";
import {
  DEFAULT_WIKIPEDIA_TOOL_CONFIG,
  WikipediaToolConfigType,
} from "./tools/wikipedia";
import { getBaseURL } from "./utils";

// Define the tool config schema
const ToolConfigSchema = z.object({
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
});

// Define the tools schema
const ToolsSchema = z.record(ToolConfigSchema);

// Define the agent config schema
export const AgentConfigSchema = z.object({
  agent_id: z.string(),
  name: z.string(),
  role: z.string(),
  system_prompt: z.string(),
  tools: ToolsSchema,
});

export type ToolConfigType = {
  name: string;
  label: string;
  description: string;
  enabled: boolean;
  config:
    | ImageGeneratorToolConfigType["config"]
    | OpenAPIToolConfigType["config"]
    | E2BInterpreterToolConfigType["config"]
    | DuckDuckGoToolConfigType["config"]
    | WikipediaToolConfigType["config"]
    | QueryEngineToolConfigType["config"];
  priority: number;
};

export type AgentConfigType = {
  agent_id: string;
  name: string;
  role: string;
  system_prompt: string;
  tools: {
    [key: string]: ToolConfigType;
  };
};

// Define default configurations
export const DEFAULT_TOOL_CONFIG: Record<
  string,
  { enabled: boolean; config: Record<string, unknown> }
> = {
  ImageGenerator: DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG,
  OpenAPI: DEFAULT_OPENAPI_TOOL_CONFIG,
  Interpreter: DEFAULT_E2B_INTERPRETER_TOOL_CONFIG, // Changed from E2BInterpreter
  DuckDuckGo: DEFAULT_DUCKDUCKGO_TOOL_CONFIG,
  Wikipedia: DEFAULT_WIKIPEDIA_TOOL_CONFIG,
  QueryEngine: DEFAULT_QUERY_ENGINE_TOOL_CONFIG,
};

export const DEFAULT_AGENT_CONFIG: Omit<AgentConfigType, "agent_id"> = {
  name: "New Agent",
  role: "",
  system_prompt: "You are a helpful assistant.",
  tools: Object.fromEntries(
    Object.entries(DEFAULT_TOOL_CONFIG).map(([key, value]) => [
      key,
      {
        name: key,
        label: key,
        description: "",
        priority: Infinity,
        ...value,
      },
    ]),
  ),
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
