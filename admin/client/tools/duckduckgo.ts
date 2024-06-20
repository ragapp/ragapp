import { z } from "zod";

export const DuckDuckGoToolConfig = z.object({
  name: z.literal("duckduckgo"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
});
export type DuckDuckGoToolConfigType = z.infer<typeof DuckDuckGoToolConfig>;
export const DEFAULT_DUCKDUCKGO_TOOL_CONFIG = {
  label: "DuckDuckGo",
  description: "",
  config: {},
  enabled: false,
};
