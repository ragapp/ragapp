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

export const ChatConfig = ({
  form,
  isSubmitting,
}: {
  form: any;
  isSubmitting: boolean;
}) => {
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
      <div className="mt-4">
        <SubmitButton isSubmitting={isSubmitting} />
      </div>
    </ExpandableSection>
  );
};
