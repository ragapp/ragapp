import { AgentConfigType } from "@/client/agent";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ToolsConfig } from "./ToolsConfig";

export const SingleAgentContent = ({
  agent,
  form,
  handleSaveChanges,
}: {
  agent: AgentConfigType;
  form: UseFormReturn<AgentConfigType>;
  handleSaveChanges: () => Promise<boolean>;
  addNewAgent?: () => void;
}) => {
  const handleInputBlur = () => {
    handleSaveChanges();
  };

  return (
    <div className="p-4 pt-8 rounded-md border">
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(handleSaveChanges)}
        >
          <FormField
            control={form.control}
            name="system_prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    onBlur={handleInputBlur}
                    rows={2}
                    placeholder="Define the responsibilities and behaviors of the agent."
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <ToolsConfig form={form} handleSaveChanges={handleSaveChanges} />
        </form>
      </Form>
    </div>
  );
};
