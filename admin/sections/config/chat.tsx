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
import { useQuery } from "react-query";

export const ChatConfig = ({}: {}) => {
  const form = useForm({
    resolver: zodResolver(ChatConfigSchema),
  });

  // Use query to fetch the chat config
  const { data, error, isLoading } = useQuery("chatConfig", getChatConfig, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  async function onSubmit(data: any) {
    try {
      await updateChatConfig(data as ChatConfigFormType);
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to update chat config",
        variant: "destructive",
      });
    }
  }

  return (
    <ExpandableSection
      name="chat-config"
      title={"Chat Config"}
      description="Config how the chatbot behaves and interacts with the user"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => onSubmit(form.getValues()))}
          className="space-y-4 mb-4"
          onBlur={() => onSubmit(form.getValues())}
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
                  <MultiInput
                    {...field}
                    onDelete={() => {
                      onSubmit(form.getValues());
                    }}
                  />
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
