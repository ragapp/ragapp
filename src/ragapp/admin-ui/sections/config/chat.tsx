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
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";

export const ChatConfig = ({}: {}) => {
  const {
    data,
    isLoading: isFetching,
    refetch,
    isRefetching,
  } = useQuery("chatConfig", getChatConfig, {
    refetchOnWindowFocus: false,
  });
  const form = useForm<ChatConfigFormType>({
    resolver: zodResolver(ChatConfigSchema),
    defaultValues: {
      custom_prompt: "",
      conversation_starters: [],
    },
    values: data,
  });

  const { mutate: updateConfig, isLoading: isSubmitting } = useMutation(
    updateChatConfig,
    {
      onError: (error: unknown) => {
        console.error(error);
        toast({
          title: "Failed to update chat config",
          variant: "destructive",
        });
        form.reset();
      },
      onSuccess: () => {
        refetch();
      },
    },
  );

  async function handleSubmit() {
    updateConfig(form.getValues());
  }

  const isLoading = isFetching || isRefetching || isSubmitting;

  return (
    <ExpandableSection
      isLoading={isLoading}
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
            disabled={isLoading}
            control={form.control}
            name="custom_prompt"
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
            disabled={isLoading}
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
