import {
  ChatConfigFormType,
  ChatConfigSchema,
  getChatConfig,
  updateChatConfig,
} from "@/client/chatConfig";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      suggest_next_questions_enabled: false,
      inline_text_citations_enabled: false,
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

          <hr className="my-6 border-t border-gray-200 dark:border-gray-700" />

          <FormField
            disabled={isLoading}
            control={form.control}
            name="suggest_next_questions_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleSubmit();
                    }}
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="mb-0">Suggest next questions</FormLabel>
                  <FormDescription>
                    Whether to suggest next questions to the users based on the
                    conversation.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            disabled={isLoading}
            control={form.control}
            name="inline_text_citations_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleSubmit();
                    }}
                  />
                </FormControl>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <FormLabel className="mb-0">
                      Inlining text citations
                    </FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <p className="text-xs text-muted-foreground">ⓘ</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Note: Inlining text citations don&apos;t work for
                            multi-agents and/or tools activated
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormDescription>
                    Whether to cite the text in the response.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ExpandableSection>
  );
};
