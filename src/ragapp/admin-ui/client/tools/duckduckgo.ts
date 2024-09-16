import { z } from "zod";

export const DuckDuckGoToolConfig = z.object({
  name: z.literal("duckduckgo"),
  label: z.string(),
  description: z.string(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
  priority: z.number(),
});

export type DuckDuckGoToolConfigType = z.infer<typeof DuckDuckGoToolConfig>;

export const DEFAULT_DUCKDUCKGO_TOOL_CONFIG: DuckDuckGoToolConfigType = {
  name: "duckduckgo",
  label: "Web Search",
  description: "Find information on the internet by searching DuckDuckGo",
  config: {},
  enabled: false,
  priority: 1,
};
