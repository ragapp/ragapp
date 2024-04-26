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
import { z } from "zod";
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

async function fetchConfig() {
  const res = await fetch("/api/management/config");
  if (!res.ok) {
    const error = await res.text();
    console.error(error);
    return {
      openai_api_key: null,
      model: null,
      system_prompt: null,
    };
  }
  const data = await res.json();
  return data;
}

async function updateConfig(data: any) {
  const res = await fetch("/api/management/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res;
}

const ConfigFormSchema = z.object({
  openai_api_key: z.string({
    required_error: "OpenAI API is required",
  }),
  model: z.string().nullable().optional(),
  system_prompt: z.string().nullable().optional(),
});

const ConfigForm = () => {
  const form = useForm({
    resolver: zodResolver(ConfigFormSchema),
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState(null);
  const supportedModels = ["gpt-3.5-turbo", "gpt-4"];

  async function onSubmit(data: any) {
    setIsSubmitting(true);

    // Send the data to the server
    const res = await updateConfig(data);
    if (!res.ok) {
      const error = await res.text();
      console.error(error);
      toast({
        className: cn(
          "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500",
        ),
        title: "Failed to update config",
      });
    } else {
      toast({
        className: cn(
          "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-green-500",
        ),
        title: "Updated config successfully",
      });
      setDefaultValues(data);
    }
    setIsSubmitting(false);
  }

  useEffect(() => {
    fetchConfig()
      .then((config) => {
        setDefaultValues(config);
      })
      .catch((error) => {
        console.error("Error fetching config:", error);
      });
  }, []);

  // Add default values to the form
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

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
                    placeholder={
                      (defaultValues as any)?.openai_api_key ?? "sk-xxx"
                    }
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
                    defaultValue={
                      (defaultValues as any)?.model ?? supportedModels[0]
                    }
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
                  <Textarea
                    placeholder={`We have provided context information below.\n---------------------\n$\{context_str\}\n---------------------\nGiven this information, please answer the question: $\{query_str\}`}
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Specify your own custom prompt to chat with. Learn more about
                  the prompt template at:{" "}
                  <a
                    href="https://docs.llamaindex.ai/en/stable/module_guides/models/prompts/"
                    style={{ textDecoration: "underline" }}
                  >
                    Prompt guide
                  </a>
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
