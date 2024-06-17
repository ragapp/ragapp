import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { MultiInput } from "@/components/ui/custom/multiInput";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export const ChatConfig = ({
  form,
  submit,
}: {
  form: any;
  submit: (data: any, showSuccessToast?: boolean) => void;
}) => {
  return (
    <ExpandableSection
      name="chat-config"
      title={"Chat Config"}
      description="Config how the chatbot behaves and interacts with the user"
    >
      <FormField
        control={form.control}
        name="system_prompt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Custom Prompt</FormLabel>
            <FormControl onBlur={() => submit(form.getValues(), false)}>
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
            <FormControl
              onBlur={() => {
                submit(form.getValues(), false);
              }}
              onChange={() => {
                // Handle for the case when the user deletes a question
                if (
                  form.getValues().conversation_starters.length <
                  field.value?.length
                ) {
                  submit(form.getValues(), false);
                }
              }}
            >
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
    </ExpandableSection>
  );
};
