import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ModelConfig, modelConfigSchema } from "../schemas";

// Helper function to check if a configuration is valid
function checkIsConfigured(config: ModelConfig | null): boolean {
  if (!config?.model_provider) return false;

  switch (config.model_provider) {
    case "openai":
      return Boolean(config.openai_api_key);
    case "gemini":
      return Boolean(config.google_api_key);
    case "ollama":
      return true;
    case "azure-openai":
      return true;
    case "t-systems":
      return Boolean(config.t_systems_llmhub_api_key);
    case "mistral":
      return Boolean(config.mistral_api_key);
    case "groq":
      return Boolean(config.groq_api_key);
    default:
      return false;
  }
}

interface ModelConfigState {
  config: ModelConfig | null;
  setConfig: (config: ModelConfig) => void;
  updateConfig: (partialConfig: Partial<ModelConfig>) => void;
  resetConfig: () => void;
  isConfigured: () => boolean;
}

export const useModelConfigStore = create<ModelConfigState>()(
  persist(
    (set, get) => ({
      config: null,
      setConfig: (config) => {
        const validatedConfig = modelConfigSchema.parse(config);
        set({ config: validatedConfig });
      },
      updateConfig: (partialConfig) =>
        set((state) => {
          if (!state.config) return state;
          const newConfig = { ...state.config, ...partialConfig };
          const validatedConfig = modelConfigSchema.parse(newConfig);
          return { config: validatedConfig };
        }),
      resetConfig: () => set({ config: null }),
      isConfigured: () => checkIsConfigured(get().config),
    }),
    {
      name: "model-config-storage",
      // Only persist the config, not the methods
      partialize: (state) => ({ config: state.config }),
    }
  )
);
