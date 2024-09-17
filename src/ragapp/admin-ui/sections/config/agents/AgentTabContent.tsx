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
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { ToolsConfig } from "./ToolsConfig";

export const AgentTabContent = ({
  agent,
  form,
  handleSaveChanges,
  isPrimary,
}: {
  agent: AgentConfigType;
  form: UseFormReturn<AgentConfigType>;
  handleSaveChanges: () => Promise<boolean>;
  isPrimary: boolean;
}) => {
  const handleInputBlur = () => {
    // Call handleSaveChanges on blur
    handleSaveChanges();
  };

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (
        type === "change" &&
        name?.includes("tools") &&
        name?.includes("enabled")
      ) {
        handleSaveChanges();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, handleSaveChanges]);

  return (
    <TabsContent
      key={agent.agent_id}
      value={agent.agent_id}
      className="p-4 pt-8 rounded-md border"
    >
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSaveChanges)}>
          {!isPrimary && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onBlur={handleInputBlur}
                        placeholder="Enter agent name"
                      />
                    </FormControl>
                    <FormDescription>
                      Unique name to identify the agent.
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
                      <Input
                        {...field}
                        onBlur={handleInputBlur}
                      />
                    </FormControl>
                    <FormDescription>
                      Helps RAGapp to assign the right agent for a task.
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
                  <Textarea
                    {...field}
                    onBlur={handleInputBlur}
                    rows={3}
                    placeholder="Define the responsibilities and behaviors of the agent."
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <ToolsConfig form={form} handleSaveChanges={handleSaveChanges} />
        </form>
      </Form>
    </TabsContent>
  );
};
