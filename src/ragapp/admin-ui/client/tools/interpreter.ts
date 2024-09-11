import { z } from "zod";

export const E2BInterpreterToolConfig = z.object({
  name: z.literal("interpreter"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z
    .union([
      z.object({
        api_key: z.string().min(1, { message: "API Key is required" }),
      }),
      z.object({}),
    ])
    .nullable()
    .optional(),
});

export type E2BInterpreterToolConfigType = z.infer<
  typeof E2BInterpreterToolConfig
>;
export const DEFAULT_E2B_INTERPRETER_TOOL_CONFIG = {
  label: "Code Interpreter",
  description: "",
  config: {
    api_key: "",
  },
  enabled: false,
};
