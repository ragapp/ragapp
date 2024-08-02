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
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { AzureOpenAIForm } from "./providers/azureOpenai";
import { GeminiForm } from "./providers/gemini";
import { GroqForm } from "./providers/groq";
import { MistralForm } from "./providers/mistral";
import { OllamaForm } from "./providers/ollama";
import { OpenAIForm } from "./providers/openai";
import { TSystemsForm } from "./providers/t-systems";

export const ModelConfig = ({
  sectionTitle,
  sectionDescription,
  configured,
  onConfigChange,
}: {
  sectionTitle: string;
  sectionDescription: string;
  configured?: boolean;
  onConfigChange: () => void;
}) => {
  const {
    data,
    isLoading: isFetching,
    refetch,
    isRefetching,
  } = useQuery("modelConfig", fetchModelConfig, {
    refetchOnWindowFocus: false,
  });
  const form = useForm({
    resolver: zodResolver(ModelConfigSchema),
    defaultValues: {
      ...getDefaultProviderConfig("openai"),
    },
    values: data,
  });

  const { mutate: updateConfig, isLoading: isSubmitting } = useMutation(
    updateModelConfig,
    {
      onError: (error: unknown) => {
        console.error(error);
        toast({
          title: "Failed to update model config",
          variant: "destructive",
        });
        // Fetch the model config again to reset the form
        refetch().then(() => {
          form.reset(data);
        });
      },
      onSuccess: () => {
        toast({
          title: "Model config updated successfully",
        });
        refetch();
        onConfigChange();
      },
    },
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Run zod form validation
    await form.trigger().then((isValid) => {
      if (isValid) {
        updateConfig(form.getValues());
      }
    });
  }

  const isLoading = isFetching || isRefetching || isSubmitting;

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
      case "t-systems":
        return <TSystemsForm form={form} defaultValues={defaultValues} />;
      case "mistral":
        return <MistralForm form={form} defaultValues={defaultValues} />;
      case "groq":
        return <GroqForm form={form} defaultValues={defaultValues} />;
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
    configured !== undefined && (
      <ExpandableSection
        open={configured ? undefined : true}
        isLoading={isLoading}
        name="update-model"
        title={sectionTitle}
        description={sectionDescription}
      >
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 mb-4">
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
                          <SelectItem
                            key={provider.value}
                            value={provider.value}
                          >
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
              <SubmitButton isSubmitting={isSubmitting} />
            </div>
          </form>
        </Form>
      </ExpandableSection>
    )
  );
};
