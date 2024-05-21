import { z } from "zod";
import { getBaseURL } from "./utils";

const DuckDuckGoToolConfig = z.object({
  name: z.literal("duckduckgo.DuckDuckGoSearchToolSpec"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
});

const WikipediaToolConfig = z.object({
  name: z.literal("wikipedia.WikipediaToolSpec"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
});

export const ToolConfigSchema = z.object({
  duckduckgo: DuckDuckGoToolConfig.optional(),
  wikipedia: WikipediaToolConfig.optional(),
});

export const DEFAULT_TOOL_CONFIG = {
  duckduckgo: {
    name: "duckduckgo.DuckDuckGoSearchToolSpec",
    label: "DuckDuckGo",
    description: "",
    config: {},
    enabled: false,
  },
  wikipedia: {
    name: "wikipedia.WikipediaToolSpec",
    label: "Wikipedia",
    description: "",
    config: {},
    enabled: false,
  },
};

export async function updateToolConfig(tool_name: string, data: any) {
  const res = await fetch(`${getBaseURL()}/api/management/tools/${tool_name}`, {
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
  return (await res.json()).data;
}

export async function getToolsConfig() {
  const res = await fetch(`${getBaseURL()}/api/management/tools`);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return await res.json();
}
