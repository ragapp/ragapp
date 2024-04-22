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

async function fetchConfig() {
  const res = await fetch("/api/management/config");
  if (!res.ok) {
    const error = await res.text();
    console.error(error);
    return {
      openai_api_key: "",
      model: "",
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
  model: z.string().optional(),
});

const ConfigForm = () => {
  const form = useForm({
    resolver: zodResolver(ConfigFormSchema),
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState(null);

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
  }, [defaultValues]);

  if (!defaultValues) {
    return <div>Loading...</div>;
  }

  return (
    <ExpandableSection
      title={"Config"}
      description="Config the OpenAI API Key and more"
      open={false}
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
                  <a href="https://platform.openai.com/api-keys">
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
                  <Input placeholder="gpt-3.5-turbo-0125" {...field} />
                </FormControl>
                <FormMessage />
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
