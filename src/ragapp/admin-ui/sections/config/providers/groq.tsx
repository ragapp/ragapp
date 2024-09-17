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

export const GroqForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const supportingModels = [
    // Llama
    "llama-3.1-70b",
    "llama-3.1-8b",
    "llama3-8b",
    "llama3-70b",
    "llama3-groq-70b-tool-use",
    "llama3-groq-8b-tool-use",
    "llama3-70b-8192",
    "llama3-8b-8192",
    // Mixtral
    "mixtral-8x7b",
    // Gemma
    "gemma2-9b-it",
    "gemma-7b-it",
    // Llava
    "llava-v1.5-7b",
  ];

  return (
    <>
      <FormField
        control={form.control}
        name="groq_api_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Groq API Key (*)</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={defaultValues.openai_api_key ?? "sk-xxx"}
                showCopy
                {...field}
              />
            </FormControl>
            <FormDescription>
              Get your API key from{" "}
              <a href="https://console.groq.com/keys" target="_blank">
                https://console.groq.com/keys
              </a>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <ModelForm
        form={form}
        defaultValue={defaultValues.model}
        supportedModels={supportingModels}
      />
    </>
  );
};
