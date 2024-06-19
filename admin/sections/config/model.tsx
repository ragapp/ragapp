import {
  ModelConfigSchema,
  fetchModelConfig,
  getDefaultProviderConfig,
  supportedProviders,
  updateModelConfig,
} from "@/client/providers";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { SubmitButton } from "@/components/ui/custom/submitButton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";
import { AzureOpenAIForm } from "./providers/azureOpenai";
import { GeminiForm } from "./providers/gemini";
import { OllamaForm } from "./providers/ollama";
import { OpenAIForm } from "./providers/openai";

export const ModelConfig = ({
  setConfigured
}: {
  setConfigured: Dispatch<SetStateAction<boolean>>
}) => {
  const form = useForm({
    resolver: zodResolver(ModelConfigSchema),
  });

  const { data, error, isLoading } = useQuery("modelConfig", fetchModelConfig, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  async function onSubmit(data: any) {
    try {
      const updateResult = await updateModelConfig(data);
      if (updateResult) {
        setConfigured(true);
      }
      toast({
        title: "Model config updated successfully",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to update model config",
        variant: "destructive",
      });
    }
  }

  const getModelForm = (form: any, defaultValues: any) => {
    switch (defaultValues.model_provider ?? "") {
      case "openai":
        return <OpenAIForm form={form} defaultValues={defaultValues} />;
      case "ollama":
        return <OllamaForm form={form} defaultValues={defaultValues} />;
      case "gemini":
        return <GeminiForm form={form} defaultValues={defaultValues} />;
      case "azure-openai":
        return <AzureOpenAIForm form={form} defaultValues={defaultValues} />;
      default:
        return null;
    }
  };

  const changeModelProvider = async (modelProvider: string) => {
    // If user changes the model provider
    // we need to reset the model config to the default value of the provider
    const newConfig = {
      ...form.getValues(),
      ...getDefaultProviderConfig(modelProvider),
    };
    // Assign the configured state to the new provider to keep the state (showing the Chat config or not)
    form.reset(newConfig);
  };

  return (
    <ExpandableSection
      name="update-model"
      title={"Update model"}
      description={"Change to a different model or use another provider"}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => onSubmit(form.getValues()))}
          className="space-y-4 mb-4"
        >
          <FormField
            control={form.control}
            name="model_provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Provider</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={form.getValues().model_provider ?? "openai"}
                    onValueChange={changeModelProvider}
                    {...field}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="OpenAI" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedProviders.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Select a model provider to chat with. If you are not sure,
                  leave it as default.
                </FormDescription>
              </FormItem>
            )}
          />

          {getModelForm(form, form.getValues())}
          <div className="mt-4">
            <SubmitButton isSubmitting={form.formState.isSubmitting} />
          </div>
        </form>
      </Form>
    </ExpandableSection>
  );
};
