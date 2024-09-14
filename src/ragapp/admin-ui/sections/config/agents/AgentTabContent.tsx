import { AgentConfigType } from "@/client/agent";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ToolsConfig } from "./ToolsConfig";
import { useEffect } from "react";

export const AgentTabContent = ({
  agent,
  form,
  handleSaveChanges,
  isPrimary,
}: {
  agent: AgentConfigType;
  form: UseFormReturn<AgentConfigType>;
  handleSaveChanges: () => void;
  isPrimary: boolean;
}) => {
  const handleInputBlur = () => {
    handleSaveChanges();
  };

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && name?.includes('tools') && name?.includes('enabled')) {
        handleSaveChanges();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, handleSaveChanges]);

  const handleSaveChangesWithValidation = () => {
    const tools = form.getValues().tools;
    let isValid = true;

    Object.entries(tools).forEach(([toolName, tool]) => {
      if (tool.enabled) {
        if (toolName === 'ImageGenerator' && !tool.config?.api_key) {
          form.setError(`tools.${toolName}.config.api_key`, {
            type: 'manual',
            message: 'API Key is required when the tool is enabled',
          });
          isValid = false;
        }
        // Add similar checks for other tools that require configuration
      }
    });

    if (isValid) {
      handleSaveChanges();
    }
  };

  return (
    <TabsContent
      key={agent.agent_id}
      value={agent.agent_id}
      className="p-4 pt-8 rounded-md border"
    >
      <Form {...form}>
        <form className="space-y-6">
          {!isPrimary && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input {...field} onBlur={handleInputBlur} placeholder="Enter agent name" />
                    </FormControl>
                    <FormDescription>
                      This is shown in the UI to help identify the agent.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Role</FormLabel>
                    <FormControl>
                      <Input {...field} onBlur={handleInputBlur} />
                    </FormControl>
                    <FormDescription>
                      Agent role is used to help orchestrator assign right tasks to the agent.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          )}
          <FormField
            control={form.control}
            name="system_prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea {...field} onBlur={handleInputBlur} rows={3} placeholder="Define the responsibilities and behaviors of the assistant." />
                </FormControl>
              </FormItem>
            )}
          />

          <ToolsConfig form={form} isPrimary={isPrimary} handleSaveChanges={handleSaveChangesWithValidation} />
        </form>
      </Form>
    </TabsContent>
  );
};
