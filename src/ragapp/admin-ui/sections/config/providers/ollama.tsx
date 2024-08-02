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

const embeddingModels = ["nomic-embed-text"];

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
      ) : getLLMModels(models ?? []).length === 0 ? (
        <FormMessage>
          There is no LLM model available using Ollama. <br />
          Please pull a Ollama LLM model from &nbsp;
          <a href="https://ollama.com/library" target="_blank" rel="noreferrer">
            https://ollama.com/library
          </a>
        </FormMessage>
      ) : getEmbeddingModels(models ?? []).length == 0 ? (
        <>
          <ModelForm
            form={form}
            defaultValue={defaultValues.model}
            supportedModels={getLLMModels(models ?? [])}
          />
          <FormMessage>
            The embedding model <i>nomic-embed-text</i> is required. Please pull
            it from{" "}
            <a
              href="https://ollama.com/library/nomic-embed-text"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              https://ollama.com/library/nomic-embed-text
            </a>
          </FormMessage>
        </>
      ) : (
        <ModelForm
          form={form}
          defaultValue={defaultValues.model}
          supportedModels={getLLMModels(models ?? [])}
        />
      )}
    </>
  );
};
