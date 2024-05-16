import {
  ConfigFormSchema,
  ConfigFormType,
  DEFAULT_CONFIG,
  fetchConfig,
  updateConfig,
} from "@/client/config";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ModelConfig } from "./model";
import { RAGConfig } from "./rag";

export const ConfigForm = ({ setConfigured }: { setConfigured: any }) => {
  const form = useForm({
    resolver: zodResolver(ConfigFormSchema),
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState(DEFAULT_CONFIG);

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-4">
        {/* Provider config */}

        <ModelConfig
          form={form}
          isSubmitting={isSubmitting}
          values={defaultValues}
          setValues={setDefaultValues}
        />

        {defaultValues.configured && (
          <RAGConfig form={form} isSubmitting={isSubmitting} />
        )}
      </form>
    </Form>
  );
};
