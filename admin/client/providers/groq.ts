import { z } from "zod";
import { BaseConfigSchema } from "./base";

export const GroqConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("groq").nullable().optional(),
  groq_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "Groq API Key is required",
    ),
});

export const DEFAULT_GROQ_CONFIG: z.input<typeof GroqConfigSchema> = {
  model_provider: "groq",
  model: "llama3-8b-8192",
  embedding_model: "all-mpnet-base-v2",
  embedding_dim: 768,
  groq_api_key: "",
};
