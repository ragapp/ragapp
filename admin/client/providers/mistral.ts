import { z } from "zod";
import { BaseConfigSchema } from "./base";

export const MistralConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("mistral"),
  mistral_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "Mistral AI API Key is required",
    ),
});

export const DEFAULT_MISTRAL_CONFIG: z.input<typeof MistralConfigSchema> = {
  model_provider: "mistral",
  model: "mistral-tiny",
  embedding_model: "mistral-embed",
  embedding_dim: 1024,
  mistral_api_key: "",
};
