import {
  CohereRerankerConfigSchema,
  getReRankerConfig,
  updateReRankerConfig,
} from "@/client/reranker";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";

export const RerankerConfig = () => {
  const form = useForm({
    resolver: zodResolver(CohereRerankerConfigSchema),
  });

  const { data: config, refetch } = useQuery(
    "rerankerConfig",
    getReRankerConfig,
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (config) {
      form.reset(config);
    }
  }, [form, config]);

  const submitRerankerForm = async (data: any) => {
    try {
      await updateReRankerConfig(data);
      refetch();
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to update reranker configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="space-y-4 mb-4"
          onBlur={form.handleSubmit(submitRerankerForm)}
        >
          <FormField
            control={form.control}
            name="use_reranker"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      // Instantly update the form value
                      field.onChange(checked);
                      submitRerankerForm(form.getValues());
                    }}
                  />
                </FormControl>
                <div>
                  <FormLabel className="font-normal">Use Reranker</FormLabel>
                  <FormMessage />
                  <FormDescription>
                    Use a reranker to improve the accuracy of the retrieved
                    documents
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {form.watch("use_reranker") && (
            <>
              <FormField
                control={form.control}
                name="cohere_api_key"
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormLabel>Cohere API Key</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormDescription>
                      You can get your API key from{" "}
                      <a
                        href="https://dashboard.cohere.com/api-keys"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://dashboard.cohere.com/api-keys
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </form>
      </Form>
    </>
  );
};
