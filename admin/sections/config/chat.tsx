import {
  ChatConfigFormType,
  ChatConfigSchema,
  getChatConfig,
  updateChatConfig,
} from "@/client/chatConfig";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { MultiInput } from "@/components/ui/custom/multiInput";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";

export const ChatConfig = ({}: {}) => {
  const form = useForm<ChatConfigFormType>({
    resolver: zodResolver(ChatConfigSchema),
  });

  // Use query to fetch the chat config
  // TODO: show isLoading state, e.g. a spinner in the exapandable section component
  const { data, error, isLoading } = useQuery("chatConfig", getChatConfig, {
    refetchOnWindowFocus: false,
  });
  const { mutate: updateConfig, updateError } = useMutation(updateChatConfig, {
    onError: (error: unknown) => {
      // TODO: form.reset(data) is just resetting to the last value, but a failure in the API
      // call doesn't guarantee that the data is still the same.
      // @Lee can we guarantee this? if not we should probably refetch the data
      // see https://tanstack.com/query/v4/docs/framework/react/guides/mutations#mutation-side-effects
      form.reset(data);
      console.error(error);
      toast({
        title: "Failed to update chat config",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  async function handleSubmit() {
    updateConfig(form.getValues());
  }

  return (
    <ExpandableSection
      name="chat-config"
      title={"Chat Config"}
      description="Config how the chatbot behaves and interacts with the user"
    >
      <Form {...form}>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-4"
          onBlur={handleSubmit}
        >
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
          <FormField
            control={form.control}
            name="conversation_starters"
            render={({ field }) => (
              <FormItem className="pt-4">
                <FormLabel>Conversation questions</FormLabel>
                <FormControl>
                  <MultiInput {...field} onDelete={handleSubmit} />
                </FormControl>
                <FormDescription>
                  Add suggested questions to help users start a conversation
                  with the app.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ExpandableSection>
  );
};
