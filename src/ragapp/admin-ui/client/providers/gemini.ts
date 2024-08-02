import { z } from "zod";
import { BaseConfigSchema } from "./base";

export const GeminiConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("gemini"),
  google_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "Google API Key is required",
    ),
});

export const DEFAULT_GEMINI_CONFIG: z.input<typeof GeminiConfigSchema> = {
  model_provider: "gemini",
  model: "gemini-1.5-pro-latest",
  embedding_model: "embedding-001",
  embedding_dim: 768,
  google_api_key: "",
};
