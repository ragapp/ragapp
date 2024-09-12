import { z } from "zod";

export const QueryEngineToolConfig = z.object({
  name: z.literal("query_engine"),
  label: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
  priority: z.number().default(0),
});
export type QueryEngineToolConfigType = z.infer<typeof QueryEngineToolConfig>;
export const DEFAULT_QUERY_ENGINE_TOOL_CONFIG = {
  label: "Query Engine",
  description: "Query information from your uploaded files",
  config: {},
  enabled: false,
  priority: 0,
};
