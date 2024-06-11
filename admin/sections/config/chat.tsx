import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { MultiInput } from "@/components/ui/custom/multiInput";
import { SubmitButton } from "@/components/ui/custom/submitButton";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";
import { reloadDemoChat } from "../demoChat";

// Get the first not null or undefined value
function useInitialValue(value: any) {
  const ref = useRef();

  useEffect(() => {
    if (value !== null && value !== undefined && ref.current === undefined) {
      ref.current = value;
    }
  }, [value]);

  return ref;
}

export const ChatConfig = ({
  form,
  isSubmitting,
  addCallback,
}: {
  form: any;
  isSubmitting: boolean;
  addCallback: any;
}) => {
  // To detect the change of conversation starters
  const conversationStarters = form.watch("conversation_starters");
  const initialConversationStartersRef = useInitialValue(conversationStarters);

  async function onClickSubmit() {
    if (
      JSON.stringify(conversationStarters) !==
      JSON.stringify(initialConversationStartersRef.current)
    ) {
      initialConversationStartersRef.current = conversationStarters;
      addCallback((prev: any) => [...prev, reloadDemoChat]);
    }
  }

  return (
    <ExpandableSection
      title={"Chat Config"}
      description="Config how the chatbot behaves and interacts with the user"
      open={true}
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
              Use system prompt to define the responsibilities and behaviors of
              the assistant.
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
              <MultiInput {...field} />
            </FormControl>
            <FormDescription>
              Add suggested questions to help users start a conversation with
              the app.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="mt-4" onClick={onClickSubmit}>
        <SubmitButton isSubmitting={isSubmitting} />
      </div>
    </ExpandableSection>
  );
};
