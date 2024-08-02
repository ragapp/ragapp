import { z } from "zod";
import { BaseConfigSchema } from "./base";

export const GroqConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("groq"),
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
  model: "llama3-8b",
  embedding_model: "all-MiniLM-L6-v2",
  embedding_dim: 384,
  groq_api_key: "",
};
