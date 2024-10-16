import { z } from "zod";

export const CodeGeneratorToolConfig = z.object({
  name: z.literal("artifact"),
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

export type CodeGeneratorToolConfigType = z.infer<
  typeof CodeGeneratorToolConfig
>;

export const DEFAULT_CODE_GENERATOR_TOOL_CONFIG: CodeGeneratorToolConfigType = {
  name: "artifact",
  label: "Code Generator",
  description:
    "Generate code, execute the code in the e2b sandbox, and display the preview panel in the chat UI",
  enabled: false,
  config: {
    api_key: null,
  },
  priority: 3,
};
