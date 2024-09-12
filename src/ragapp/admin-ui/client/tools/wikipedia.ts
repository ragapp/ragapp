import { z } from "zod";

export const WikipediaToolConfig = z.object({
  name: z.literal("wikipedia"),
  label: z.string().nullable().optional(),
  description: z.string().default("Search for information on Wikipedia"),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
  priority: z.number().default(2),
});
export type WikipediaToolConfigType = z.infer<typeof WikipediaToolConfig>;
export const DEFAULT_WIKIPEDIA_TOOL_CONFIG = {
  label: "Wikipedia",
  description: "Search for information on Wikipedia",
  config: {},
  enabled: false,
  priority: 2,
};
