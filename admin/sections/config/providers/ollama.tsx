import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ModelForm } from "./shared";

export const OllamaForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const defaultModels = ["llama3:8b", "phi3"];
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
      <ModelForm
        form={form}
        defaultValues={defaultValues}
        supportedModels={defaultModels}
      />
    </>
  );
};
