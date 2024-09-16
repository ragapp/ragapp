import { z } from "zod";

export const QueryEngineToolConfig = z.object({
  name: z.literal("query_engine"),
  label: z.string(),
  description: z.string(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
  priority: z.number(),
});

export type QueryEngineToolConfigType = z.infer<typeof QueryEngineToolConfig>;

export const DEFAULT_QUERY_ENGINE_TOOL_CONFIG: QueryEngineToolConfigType = {
  name: "query_engine",
  label: "Use Knowledge",
  description: "Query information from your knowledge base",
  config: {},
  enabled: false,
  priority: 1, // Assign a priority value
};
