import { ChatConfigFormType, ChatConfigSchema } from "@/client/chatConfig";
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

const fakeApiGetChatConfig = async (): Promise<
  ChatConfigFormType | undefined
> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const str = localStorage.getItem("TEST_CHAT_CONFIG");
  return str ? JSON.parse(str) : undefined;
};

const fakeApiSaveChatConfig = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (data.system_prompt?.length > 10) {
    throw new Error("System prompt is too long");
  }
  localStorage.setItem("TEST_CHAT_CONFIG", JSON.stringify(data));
};

export const ChatConfig = ({}: {}) => {
  const {
    data,
    isLoading: isFetching,
    refetch,
    isRefetching,
  } = useQuery("chatConfig", fakeApiGetChatConfig, {
    refetchOnWindowFocus: false,
  });
  const form = useForm<ChatConfigFormType>({
    resolver: zodResolver(ChatConfigSchema),
    defaultValues: {
      system_prompt: "",
      conversation_starters: [],
    },
    values: data,
  });

  const { mutate: updateConfig, isLoading: isSubmitting } = useMutation(
    fakeApiSaveChatConfig,
    {
      onError: (error: unknown) => {
        console.error(error);
        toast({
          title: "Failed to update chat config",
          variant: "destructive",
        });
        form.reset();
      },
    },
  );

  async function handleSubmit() {
    updateConfig(form.getValues());
    await refetch();
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
