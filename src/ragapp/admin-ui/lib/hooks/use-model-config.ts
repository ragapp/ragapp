import { useModelConfigStore } from "../stores/model-config";
import type { ModelConfig } from "../schemas";

export function useModelConfig() {
  const store = useModelConfigStore();
  
  return {
    config: store.config,
    isConfigured: store.isConfigured,
    setConfig: store.setConfig,
    updateConfig: store.updateConfig,
    resetConfig: store.resetConfig,
  } as const;
}

// Helper type for the hook return value
export type UseModelConfigReturn = ReturnType<typeof useModelConfig>;
