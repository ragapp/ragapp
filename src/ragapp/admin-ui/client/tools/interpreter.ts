import { z } from "zod";

export const E2BInterpreterToolConfig = z.object({
  name: z.literal("interpreter"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z
    .object({
      api_key: z
        .string()
        .nullable()
        .refine(
          (data) => {
            return data && data.length > 0;
          },
          { message: "API Key is required" },
        ),
    })
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
