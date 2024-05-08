import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ConfigFormSchema,
  ConfigFormType,
  DEFAULT_CONFIG,
  fetchConfig,
  updateConfig,
} from "@/client/config";

const ConfigForm = ({ setConfigured }: { setConfigured: any }) => {
  const form = useForm({
    resolver: zodResolver(ConfigFormSchema),
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState(DEFAULT_CONFIG);
  const supportedModels = ["gpt-3.5-turbo", "gpt-4"];

  async function onSubmit(data: any) {
    setIsSubmitting(true);

    // Send the data to the server
    try {
      const configData = await updateConfig(data as ConfigFormType);
      toast({
        className: cn(
          "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-green-500",
        ),
        title: "Updated config successfully",
      });

      setDefaultValues(configData);
      if (configData.configured) {
        setConfigured(true);
      } else {
        setConfigured(false);
      }
    } catch (err) {
      console.error(err);
      toast({
        className: cn(
          "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500",
        ),
        title: "Failed to update config",
      });
    }
    setIsSubmitting(false);
  }

  useEffect(() => {
    fetchConfig()
      .then((config) => {
        setDefaultValues(config);
        // Set the configured state
        // todo: Consider to use provider or other state management
        if (config.configured) {
          setConfigured(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching config:", error);
      });
  }, [setConfigured]);

  // Add default values to the form
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, setConfigured]);

  if (!defaultValues) {
    return <div>Loading...</div>;
  }

  return (
    <ExpandableSection
      title={"Config"}
      description="Config the OpenAI API Key and more"
      open={true}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="openai_api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OpenAI API Key (*)</FormLabel>
                <FormControl>
                  <Input
                    placeholder={defaultValues.openai_api_key ?? "sk-xxx"}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                  >
                    https://platform.openai.com/api-keys
                  </a>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={defaultValues.model ?? supportedModels[0]}
                    onValueChange={field.onChange}
                    {...field}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={supportedModels[0]} />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedModels?.map((model: string) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Select a model to chat with. If you are not sure, leave it as
                  default.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="system_prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Prompt</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormDescription>
                  Use system prompt to define the responsibilities and behaviors
                  of the assistant.
                </FormDescription>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`animate-spin`}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              "Update"
            )}
          </Button>
        </form>
      </Form>
    </ExpandableSection>
  );
};

export { ConfigForm };
