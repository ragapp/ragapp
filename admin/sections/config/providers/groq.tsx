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
  const supportingModels = ["llama3-8b", "llama3-70b", "mixtral-8x7b"];

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
