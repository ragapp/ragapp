import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { UseFormReturn } from "react-hook-form";
import { ModelForm } from "./shared";

export const OpenAIForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const supportingModels = ["gpt-3.5-turbo", "gpt-4", "gpt-4o"];
  const embeddingModels = ["text-embedding-3-small", "text-embedding-3-large"];

  return (
    <>
      <FormField
        control={form.control}
        name="openai_api_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>OpenAI API Key (*)</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={defaultValues.openai_api_key ?? "sk-xxx"}
                showCopy
                {...field}
              />
            </FormControl>
            <FormDescription>
              Get your API key from{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank">
                https://platform.openai.com/api-keys
              </a>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex space-x-4">
        <div className="w-1/2">
          <ModelForm
            form={form}
            defaultValues={defaultValues}
            supportedModels={supportingModels}
          />
        </div>
        <div className="w-1/2">
          <ModelForm
            form={form}
            defaultValues={defaultValues}
            supportedModels={embeddingModels}
            title="Embedding Model"
            description="Select a text embedding model to embed text."
            model_field_name="embedding_model"
          />
        </div>
      </div>
    </>
  );
};
