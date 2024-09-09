import { z } from "zod";
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
  system_prompt: z.string(),
  tools: ToolsSchema,
});

export type AgentConfigType = z.infer<typeof AgentConfigSchema>;

// Define default configurations
export const DEFAULT_TOOL_CONFIG: Record<
  string,
  { enabled: boolean; config: Record<string, unknown> }
> = {
  DuckDuckGo: { enabled: false, config: { max_results: 5 } },
  Wikipedia: { enabled: false, config: { language: "en" } },
  OpenAPI: { enabled: false, config: {} },
  E2BInterpreter: { enabled: false, config: { timeout: 30 } },
  ImageGenerator: {
    enabled: false,
    config: { model: "dall-e-3", size: "1024x1024" },
  },
};

export const DEFAULT_AGENT_CONFIG: Omit<AgentConfigType, "agent_id"> = {
  name: "New Agent",
  system_prompt: "You are a helpful assistant.",
  tools: DEFAULT_TOOL_CONFIG,
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
