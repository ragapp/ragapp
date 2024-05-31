import { z } from "zod";
import { BaseConfigSchema } from ".";

export const OpenAIConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("openai").nullable().optional(),
  openai_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "OpenAI API Key is required",
    ),
});

export const DEFAULT_OPENAI_CONFIG: z.input<typeof OpenAIConfigSchema> = {
  model_provider: "openai",
  model: "gpt-3.5-turbo",
  embedding_model: "text-embedding-3-small",
  embedding_dim: 1536,
  openai_api_key: "",
};
