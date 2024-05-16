import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { SubmitButton } from "@/components/ui/custom/submitButton";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export const RAGConfig = ({
  form,
  isSubmitting,
}: {
  form: any;
  isSubmitting: boolean;
}) => {
  return (
    <ExpandableSection
      title={"RAG Config"}
      description="Modify RAG parameters to improve the AI's performance."
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
      <div className="mt-4">
        <SubmitButton isSubmitting={isSubmitting} />
      </div>
    </ExpandableSection>
  );
};
