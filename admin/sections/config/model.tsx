import {
  ConfigFormType,
  getDefaultConfig,
  supportedProviders,
} from "@/client/config";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { SubmitButton } from "@/components/ui/custom/submitButton";
import {
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
import { GeminiForm } from "./providers/gemini";
import { OllamaForm } from "./providers/ollama";
import { OpenAIForm } from "./providers/openai";

export const ModelConfig = ({
  form,
  isSubmitting,
  values,
  setValues,
}: {
  form: any;
  isSubmitting: boolean;
  values: ConfigFormType;
  setValues: (values: ConfigFormType) => void;
}) => {
  const getModelForm = (form: any, defaultValues: any) => {
    switch (defaultValues.model_provider ?? "") {
      case "openai":
        return <OpenAIForm form={form} defaultValues={defaultValues} />;
      case "ollama":
        return <OllamaForm form={form} defaultValues={defaultValues} />;
      case "gemini":
        return <GeminiForm form={form} defaultValues={defaultValues} />;
      default:
        return null;
    }
  };

  const changeModelProvider = async (modelProvider: string) => {
    // If user changes the model provider
    // we need to reset the model config to the default value of the provider
    const providerConfig = getDefaultConfig(modelProvider);
    // Assign the configured state to the new provider to keep the state (showing the Rag config or not)
    providerConfig.configured =
      values.configured !== undefined ? values.configured : null;
    form.reset(providerConfig);
    setValues(providerConfig);
  };

  return (
    <ExpandableSection
      title={"AI Config"}
      description="Configure the AI model."
      open={true}
    >
      <FormField
        control={form.control}
        name="model_provider"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Model Provider</FormLabel>
            <FormControl>
              <Select
                defaultValue={values.model_provider ?? "openai"}
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
              Select a model provider to chat with. If you are not sure, leave
              it as default.
            </FormDescription>
          </FormItem>
        )}
      />

      {getModelForm(form, values)}
      <div className="mt-4">
        <SubmitButton isSubmitting={isSubmitting} />
      </div>
    </ExpandableSection>
  );
};
