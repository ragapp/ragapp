import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { UseFormReturn } from "react-hook-form";
import { ModelForm } from "./shared";

const SUPPORTED_MODELS = [
  "gpt-35-turbo",
  "gpt-4-32k-1",
  "gpt-4-32k-canada",
  "gpt-4-32k-france",
  "gpt-4-turbo-128k-france",
  "Llama2-70b-Instruct",
  "Llama-3-70B-Instruct",
  "Mixtral-8x7B-Instruct-v0.1",
  "mistral-large-32k-france",
  "CodeLlama-2",
];

const EMBEDDING_MODELS = [
  "text-embedding-ada-002",
  "text-embedding-ada-002-france",
  "jina-embeddings-v2-base-de",
  "jina-embeddings-v2-base-code",
  "text-embedding-bge-m3",
];

export const TSystemsForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="t_systems_llmhub_api_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LLMHub API Key (*)</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={defaultValues.t_systems_llmhub_api_key}
                showCopy
                {...field}
              />
            </FormControl>
            <FormDescription>Enter your API key for the LLMHub</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex space-x-4">
        <div className="w-1/2">
          <ModelForm
            form={form}
            defaultValue={defaultValues.model}
            supportedModels={SUPPORTED_MODELS}
          />
        </div>
        <div className="w-1/2">
          <ModelForm
            form={form}
            defaultValue={defaultValues.embedding_model}
            supportedModels={EMBEDDING_MODELS}
            title="Embedding Model"
            description="Select a text embedding model to embed text."
            name="embedding_model"
          />
        </div>
      </div>
      <FormField
        control={form.control}
        name="t_systems_llmhub_api_base"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LLMHub API Base URL</FormLabel>
            <FormControl>
              <Input
                placeholder={
                  defaultValues.t_systems_llmhub_api_base ??
                  "https://llm-server.llmhub.t-systems.net/v2"
                }
                {...field}
              />
            </FormControl>
            <FormDescription>
              Optional, set this if you are using a custom LLMHub API endpoint.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
