import { z } from "zod";

export const WikipediaToolConfig = z.object({
  name: z.literal("wikipedia"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
});
export type WikipediaToolConfigType = z.infer<typeof WikipediaToolConfig>;
export const DEFAULT_WIKIPEDIA_TOOL_CONFIG = {
  label: "Wikipedia",
  description: "",
  config: {},
  enabled: false,
};
