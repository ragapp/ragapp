import { z } from "zod";
import { BaseConfigSchema } from ".";

export const OllamaConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("ollama").nullable().optional(),
  ollama_base_url: z
    .string()
    .default("http://host.docker.internal:11434")
    .nullable()
    .optional(),
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
