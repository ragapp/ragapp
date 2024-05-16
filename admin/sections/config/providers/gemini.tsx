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

export const GeminiForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const supportingModels = [
    "gemini-1.5-pro-latest",
    "gemini-pro",
    "gemini-pro-vision",
  ];

  return (
    <>
      <FormField
        control={form.control}
        name="google_api_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Google API Key (*)</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={defaultValues.google_api_key ?? ""}
                showCopy
                {...field}
              />
            </FormControl>
            <FormDescription>
              Please follow this page to get an API key{" "}
              <a
                href="https://ai.google.dev/gemini-api/docs/api-key"
                target="_blank"
              >
                https://ai.google.dev/gemini-api/docs/api-key
              </a>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <ModelForm
        form={form}
        defaultValues={defaultValues}
        supportedModels={supportingModels}
      />
    </>
  );
};
