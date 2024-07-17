import { z } from "zod";
import { BaseConfigSchema } from "./base";

export const OllamaConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("ollama"),
  ollama_base_url: z
    .string()
    .trim()
    .default("http://host.docker.internal:11434")
    .optional()
    .refine(
      (value) => {
        if (value === undefined) {
          return false;
        }
        if (value.endsWith("/")) {
          return false;
        }
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid URL" },
    ),
  ollama_request_timeout: z.coerce
    .number()
    .default(120.0)
    .nullable()
    .optional(),
});

export const DEFAULT_OLLAMA_CONFIG: z.input<typeof OllamaConfigSchema> = {
  model_provider: "ollama",
  model: "phi3:latest",
  embedding_model: "nomic-embed-text",
  embedding_dim: 768,
  ollama_base_url: "http://host.docker.internal:11434",
  ollama_request_timeout: 120.0,
};
