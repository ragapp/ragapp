import { z } from "zod";
import { BaseConfigSchema } from "./base";

export const OpenAIConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("openai"),
  openai_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "OpenAI API Key is required",
    ),
  openai_api_base: z
    .string()
    .nullable()
    .optional()
    .refine((value) => {
      try {
        if (value) new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "Invalid API Base URL"),
});

export const DEFAULT_OPENAI_CONFIG: z.input<typeof OpenAIConfigSchema> = {
  model_provider: "openai",
  model: "gpt-4o-mini",
  embedding_model: "text-embedding-3-small",
  embedding_dim: 1536,
  openai_api_key: "",
};
