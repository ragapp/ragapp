import { z } from "zod";
import { BaseConfigSchema } from "./base";

export const TSystemsConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("t-systems"),
  t_systems_llmhub_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "T-Systems LLMHub API Key is required",
    ),
  t_systems_llmhub_api_base: z
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

export const DEFAULT_TSYSTEMS_CONFIG: z.input<typeof TSystemsConfigSchema> = {
  model_provider: "t-systems",
  model: "gpt-35-turbo",
  embedding_model: "text-embedding-bge-m3",
  embedding_dim: 1536,
  t_systems_llmhub_api_base: "https://llm-server.llmhub.t-systems.net/v2",
};
