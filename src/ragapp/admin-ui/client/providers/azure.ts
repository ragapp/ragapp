import { z } from "zod";
import { BaseConfigSchema } from "./base";

export const AzureOpenAIConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("azure-openai"),
  azure_openai_endpoint: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "Azure OpenAI endpoint is required",
    )
    .refine(
      (value) => value && value.trim().startsWith("https://"),
      "Azure OpenAI endpoint must start with 'https://'",
    ),
  azure_openai_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "Azure OpenAI API key is required",
    ),
  azure_openai_llm_deployment: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "Azure OpenAI LLM deployment name is required",
    ),
  azure_openai_embedding_deployment: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "Azure OpenAI embedding deployment name is required",
    ),
});

export const DEFAULT_AZURE_OPENAI_CONFIG: z.input<
  typeof AzureOpenAIConfigSchema
> = {
  model_provider: "azure-openai",
  model: "gpt-35-turbo",
  embedding_model: "text-embedding-3-small",
  embedding_dim: 1536,
};
