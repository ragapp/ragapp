import { fetchModels } from "@/client/config";
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
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ModelForm } from "./shared";

export const OllamaForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const [models, setModels] = useState<string[]>();

  // Fetch models from the api
  useEffect(() => {
    fetchModels("ollama")
      .then((data) => {
        setModels(data);
      })
      .catch((err) => {
        console.error(err);
        toast({
          className: cn(
            "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500",
          ),
          title: "Failed to fetch Ollama models",
        });
      });
  }, []);

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
        supportedModels={models ?? []}
      />
      {models?.length === 0 && (
        <FormMessage>
          There is no available model from Ollama. <br />
          To start with Ollama provider, please pull a LLM model and
          <b>nomic-embed-text</b> embedding model from &nbsp;
          <a href="https://ollama.com/library" target="_blank" rel="noreferrer">
            https://ollama.com/library
          </a>
        </FormMessage>
      )}
      {models?.includes("nomic-embed-text") ? null : (
        <FormMessage>
          The model <i>nomic-embed-text</i> is required. Please pull the model
          from{" "}
          <a
            href="https://ollama.com/library/nomic-embed-text"
            target="_blank"
            rel="noreferrer"
          >
            {" "}
            https://ollama.com/library/nomic-embed-text
          </a>
        </FormMessage>
      )}
    </>
  );
};
