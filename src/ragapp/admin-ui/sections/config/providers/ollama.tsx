import { fetchModels } from "@/client/providers";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "react-query";
import { ModelForm } from "./shared";

// The list defines the supported embedding models
const embeddingModels = ["nomic-embed-text", "jina/jina-embeddings-v2-base-de"];

const getLLMModels = (models: string[]) => {
  return models.filter((model) => {
    const modelName = model.split(":")[0];
    return !embeddingModels.includes(modelName);
  });
};

const getEmbeddingModels = (models: string[]) => {
  return models.filter((model) => {
    const modelName = model.split(":")[0];
    return embeddingModels.includes(modelName);
  });
};

export const OllamaForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const {
    data: models,
    isLoading,
    isError,
  } = useQuery(
    ["models", form.getValues("ollama_base_url")],
    () => {
      const ollamaBaseUrl = form.getValues("ollama_base_url");
      return ollamaBaseUrl && fetchModels("ollama", ollamaBaseUrl);
    },
    {
      staleTime: 300000, // 5 minutes
      onError: (error: unknown) => {
        console.error("Failed to fetch Ollama models:", error);
        toast({
          title: "Failed to fetch Ollama models",
          variant: "destructive",
          duration: 5000,
        });
      },
    },
  );

  // Extract LLM and embedding models from the fetched models
  const llmModels = getLLMModels(models ?? []);
  const embeddingModelsAvailable = getEmbeddingModels(models ?? []);

  return (
    <>
      <FormField
        control={form.control}
        name="ollama_base_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ollama Base URL</FormLabel>
            <FormControl>
              <Input
                placeholder={defaultValues.ollama_base_url ?? ""}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Set to http://host.docker.internal:11434 if you are running Ollama
              locally
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="ollama_request_timeout"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Request timeout</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder={defaultValues.ollama_request_timeout}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Timeout in seconds for Ollama API requests.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isError ? (
        <FormMessage>
          Could not fetch Ollama models. Make sure the Ollama base URL is
          accessible with RAGapp.
        </FormMessage>
      ) : llmModels.length === 0 ? (
        <FormMessage>
          There is no LLM model available using Ollama. <br />
          Please pull a Ollama LLM model from &nbsp;
          <a href="https://ollama.com/library" target="_blank" rel="noreferrer">
            https://ollama.com/library
          </a>
        </FormMessage>
      ) : embeddingModelsAvailable.length === 0 ? (
        <>
          <ModelForm
            form={form}
            defaultValue={defaultValues.model}
            supportedModels={llmModels}
          />
          <FormMessage>
            One of the embedding models <i>{embeddingModels.join(", ")}</i> is
            required. Please pull an Ollama embedding model (e.g.,{" "}
            <i>nomic-embed-text</i>) from &nbsp;
            <a
              href="https://ollama.com/library"
              target="_blank"
              rel="noreferrer"
            >
              https://ollama.com/library
            </a>
          </FormMessage>
        </>
      ) : (
        <>
          <ModelForm
            form={form}
            defaultValue={defaultValues.model}
            supportedModels={llmModels}
          />
          <ModelForm
            form={form}
            name="embedding_model"
            title="Embedding Model"
            description="Select an embedding model for text embeddings."
            defaultValue={defaultValues.embedding_model}
            supportedModels={embeddingModelsAvailable}
          />
        </>
      )}
    </>
  );
};
