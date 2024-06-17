import {
  ConfigFormSchema,
  ConfigFormType,
  DEFAULT_CONFIG,
  fetchConfig,
  updateConfig,
} from "@/client/config";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ChatConfig } from "./chat";
import { ModelConfig } from "./model";

export const ConfigForm = ({ setConfigured }: { setConfigured: any }) => {
  const form = useForm({
    resolver: zodResolver(ConfigFormSchema),
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState(DEFAULT_CONFIG);

  async function onSubmit(data: any, showSuccessToast = true) {
    setIsSubmitting(true);

    // Send the data to the server
    try {
      const configData = await updateConfig(data as ConfigFormType);
      if (showSuccessToast) {
        toast({
          title: "Config updated successfully",
        });
      }

      setDefaultValues(configData);
      if (configData.configured) {
        setConfigured(true);
      } else {
        setConfigured(false);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to update config",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      <form
        onSubmit={form.handleSubmit(() => onSubmit(form.getValues(), true))}
        className="space-y-4 mb-4"
      >
        {/* Provider config */}

        <ModelConfig
          form={form}
          isSubmitting={isSubmitting}
          values={defaultValues}
          setValues={setDefaultValues}
        />

        {defaultValues.configured && (
          <ChatConfig form={form} submit={onSubmit} />
        )}
      </form>
    </Form>
  );
};
