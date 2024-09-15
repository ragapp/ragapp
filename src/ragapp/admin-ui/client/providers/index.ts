import { z } from "zod";
import { getBaseURL } from "../utils";
import { AzureOpenAIConfigSchema, DEFAULT_AZURE_OPENAI_CONFIG } from "./azure";
import { DEFAULT_GEMINI_CONFIG, GeminiConfigSchema } from "./gemini";
import { DEFAULT_GROQ_CONFIG, GroqConfigSchema } from "./groq";
import { DEFAULT_MISTRAL_CONFIG, MistralConfigSchema } from "./mistral";
import { DEFAULT_OLLAMA_CONFIG, OllamaConfigSchema } from "./ollama";
import { DEFAULT_OPENAI_CONFIG, OpenAIConfigSchema } from "./openai";
import { DEFAULT_TSYSTEMS_CONFIG, TSystemsConfigSchema } from "./t-systems";

export const ModelConfigSchema = z
  .union([
    OpenAIConfigSchema,
    GeminiConfigSchema,
    OllamaConfigSchema,
    AzureOpenAIConfigSchema,
    TSystemsConfigSchema,
    MistralConfigSchema,
    GroqConfigSchema,
  ])
  .refine((data) => {
    switch (data.model_provider) {
      case "openai":
        return OpenAIConfigSchema.parse(data);
      case "gemini":
        return GeminiConfigSchema.parse(data);
      case "ollama":
        return OllamaConfigSchema.parse(data);
      case "azure-openai":
        return AzureOpenAIConfigSchema.parse(data);
      case "t-systems":
        return TSystemsConfigSchema.parse(data);
      case "mistral":
        return MistralConfigSchema.parse(data);
      case "groq":
        return GroqConfigSchema.parse(data);
      default:
        return true;
    }
  });

export type ModelConfigType = z.TypeOf<typeof ModelConfigSchema>;

export const supportedProviders = [
  {
    name: "OpenAI",
    value: "openai",
  },
  {
    name: "Gemini",
    value: "gemini",
  },
  {
    name: "Ollama",
    value: "ollama",
  },
  {
    name: "Azure OpenAI",
    value: "azure-openai",
  },
  {
    name: "T-Systems LLMHub",
    value: "t-systems",
  },
  {
    name: "Mistral AI",
    value: "mistral",
  },
  {
    name: "Groq",
    value: "groq",
  },
];

export const getDefaultProviderConfig = (provider: string) => {
  switch (provider) {
    case "openai":
      return DEFAULT_OPENAI_CONFIG;
    case "ollama":
      return DEFAULT_OLLAMA_CONFIG;
    case "gemini":
      return DEFAULT_GEMINI_CONFIG;
    case "azure-openai":
      return DEFAULT_AZURE_OPENAI_CONFIG;
    case "t-systems":
      return DEFAULT_TSYSTEMS_CONFIG;
    case "mistral":
      return DEFAULT_MISTRAL_CONFIG;
    case "groq":
      return DEFAULT_GROQ_CONFIG;
    default:
      throw new Error(`Provider ${provider} not supported`);
  }
};

export const fetchModelConfig = async (): Promise<ModelConfigType> => {
  const res = await fetch(`${getBaseURL()}/api/management/config/models`);
  if (!res.ok) {
    throw new Error("Failed to fetch model config");
  }
  return res.json();
};

export const updateModelConfig = async (
  data: ModelConfigType,
): Promise<ModelConfigType> => {
  const res = await fetch(`${getBaseURL()}/api/management/config/models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update model config");
  }
  return res.json();
};

export async function fetchModels(
  provider: string,
  providerUrl?: string,
): Promise<string[]> {
  const params = new URLSearchParams({
    provider: provider,
    ...(providerUrl && { provider_url: providerUrl }),
  });

  const url = `${getBaseURL()}/api/management/config/models/list?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  const data = await res.json();
  return data;
}
