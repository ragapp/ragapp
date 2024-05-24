import { z } from "zod";
import { getBaseURL } from "./utils";

// Rag config scheme
export const RagConfigSchema = z.object({
  system_prompt: z.string().nullable().optional(),
});

// Model config schemes
const BaseConfigSchema = z.object({
  model_provider: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  embedding_model: z.string().nullable().optional(),
  embedding_dim: z.number().nullable().optional(),
  configured: z.boolean().nullable().optional(),
});
const OpenAIConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("openai").nullable().optional(),
  openai_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "OpenAI API Key is required",
    ),
});
const GeminiConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("gemini").nullable().optional(),
  google_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "Google API Key is required",
    ),
});
const OllamaConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("ollama").nullable().optional(),
  ollama_base_url: z
    .string()
    .default("http://host.docker.internal:11434")
    .nullable()
    .optional(),
});

// Merge the model config schemes with the Rag config scheme
export const ConfigFormSchema = z
  .union([
    OpenAIConfigSchema.merge(RagConfigSchema),
    GeminiConfigSchema.merge(RagConfigSchema),
    OllamaConfigSchema.merge(RagConfigSchema),
  ])
  .refine((data) => {
    switch (data.model_provider) {
      case "openai":
        return OpenAIConfigSchema.parse(data);
      case "gemini":
        return GeminiConfigSchema.parse(data);
      case "ollama":
        return OllamaConfigSchema.parse(data);
      default:
        return true;
    }
  });

export type ConfigFormType = z.TypeOf<typeof ConfigFormSchema>;

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
];

export const DEFAULT_OPENAI_CONFIG: z.input<typeof OpenAIConfigSchema> = {
  model_provider: "openai",
  model: "gpt-3.5-turbo",
  embedding_model: "text-embedding-3-small",
  embedding_dim: 1536,
  openai_api_key: "",
};
export const DEFAULT_GEMINI_CONFIG: z.input<typeof GeminiConfigSchema> = {
  model_provider: "gemini",
  model: "gemini-1.5-pro-latest",
  embedding_model: "embedding-001",
  embedding_dim: 768,
  google_api_key: "",
};
export const DEFAULT_OLLAMA_CONFIG: z.input<typeof OllamaConfigSchema> = {
  model_provider: "ollama",
  model: "phi3:latest",
  embedding_model: "nomic-embed-text",
  embedding_dim: 768,
  ollama_base_url: "http://host.docker.internal:11434",
};

export const DEFAULT_CONFIG: z.input<typeof ConfigFormSchema> = {};

export const getDefaultConfig = (provider: string) => {
  const config = {
    system_prompt: null,
    configured: false,
  };

  switch (provider) {
    case "openai":
      return { ...config, ...DEFAULT_OPENAI_CONFIG };
    case "ollama":
      return { ...config, ...DEFAULT_OLLAMA_CONFIG };
    case "gemini":
      return { ...config, ...DEFAULT_GEMINI_CONFIG };
    default:
      return { ...config };
  }
};

export async function fetchConfig(): Promise<ConfigFormType> {
  const res = await fetch(`${getBaseURL()}/api/management/config`);
  if (!res.ok) {
    const error = await res.text();
    console.error(error);
    return DEFAULT_CONFIG;
  }
  const data = await res.json();
  return data;
}

export async function updateConfig(
  data: ConfigFormType,
): Promise<ConfigFormType> {
  // Ignore configured attribute
  const { configured, ...updateValues } = data;

  const res = await fetch(`${getBaseURL()}/api/management/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateValues),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return (await res.json()).data as ConfigFormType;
}

export async function fetchModels(
  provider: string,
  providerUrl: string,
): Promise<string[]> {
  const res = await fetch(
    `${getBaseURL()}/api/management/config/models?provider=${provider}&provider_url=${encodeURIComponent(providerUrl)}`,
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  const data = await res.json();
  return data;
}
