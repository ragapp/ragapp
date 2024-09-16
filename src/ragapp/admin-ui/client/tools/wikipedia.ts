import { z } from "zod";

export const WikipediaToolConfig = z.object({
  name: z.literal("wikipedia"),
  label: z.string(),
  description: z.string(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
  priority: z.number(),
});

export type WikipediaToolConfigType = z.infer<typeof WikipediaToolConfig>;

export const DEFAULT_WIKIPEDIA_TOOL_CONFIG: WikipediaToolConfigType = {
  name: "wikipedia",
  label: "Wikipedia",
  description: "Search for information on Wikipedia",
  config: {},
  enabled: false,
  priority: 2,
};
