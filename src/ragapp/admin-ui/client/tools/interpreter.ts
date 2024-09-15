import { z } from "zod";

export const E2BInterpreterToolConfig = z.object({
  name: z.literal("interpreter"),
  label: z.string().nullable().optional(),
  description: z.string(),
  enabled: z.boolean().nullable().optional(),
  priority: z.number(),
  config: z
    .object({
      api_key: z.string().min(1, { message: "API Key is required" }).nullable(),
    })
    .nullable()
    .optional(),
});

export type E2BInterpreterToolConfigType = z.infer<
  typeof E2BInterpreterToolConfig
>;

export const DEFAULT_E2B_INTERPRETER_TOOL_CONFIG: E2BInterpreterToolConfigType =
  {
    name: "interpreter",
    label: "Code Interpreter",
    description:
      "Execute python code in a sandboxed environment using E2B code interpreter",
    enabled: false,
    config: {
      api_key: null,
    },
    priority: 3,
  };
