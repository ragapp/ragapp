import { z } from "zod";

export const openAIConfigSchema = z.object({
  openai_api_key: z.string().nullable().describe("The OpenAI API key to use"),
  openai_api_base: z.string().nullable().describe("The base URL for the OpenAI API"),
});

export const geminiConfigSchema = z.object({
  google_api_key: z.string().nullable().describe("The Google API key to use"),
});

export const ollamaConfigSchema = z.object({
  ollama_base_url: z.string().nullable().describe("The base URL for the Ollama API"),
  ollama_request_timeout: z.number().nullable().default(120.0).describe("The request timeout for the Ollama API in seconds"),
});

export const azureOpenAIConfigSchema = z.object({
  azure_openai_endpoint: z.string().nullable().describe("The Azure OpenAI endpoint to use"),
  azure_openai_api_key: z.string().nullable().describe("The Azure OpenAI API key to use"),
});

export const tSystemsConfigSchema = z.object({
  t_systems_llmhub_api_key: z.string().nullable().describe("The T-Systems LLMHub API key to use"),
  t_systems_llmhub_api_base: z.string().nullable().default("https://llm-server.llmhub.t-systems.net/v2").describe("The base URL for the T-Systems LLMHub API"),
});

export const mistralConfigSchema = z.object({
  mistral_api_key: z.string().nullable().describe("The Mistral API key to use"),
});

export const groqConfigSchema = z.object({
  groq_api_key: z.string().nullable().describe("The Groq API key to use"),
});

export const modelConfigSchema = z.object({
  model_provider: z.string().nullable().describe("The name of AI provider."),
  model: z.string().nullable().describe("The model to use for the LLM."),
  embedding_model: z.string().nullable().describe("The embedding model to use for the LLM."),
}).merge(openAIConfigSchema)
  .merge(geminiConfigSchema)
  .merge(ollamaConfigSchema)
  .merge(azureOpenAIConfigSchema)
  .merge(tSystemsConfigSchema)
  .merge(mistralConfigSchema)
  .merge(groqConfigSchema);

// Infer types from the schemas
export type OpenAIConfig = z.infer<typeof openAIConfigSchema>;
export type GeminiConfig = z.infer<typeof geminiConfigSchema>;
export type OllamaConfig = z.infer<typeof ollamaConfigSchema>;
export type AzureOpenAIConfig = z.infer<typeof azureOpenAIConfigSchema>;
export type TSystemsConfig = z.infer<typeof tSystemsConfigSchema>;
export type MistralConfig = z.infer<typeof mistralConfigSchema>;
export type GroqConfig = z.infer<typeof groqConfigSchema>;
export type ModelConfig = z.infer<typeof modelConfigSchema>;
