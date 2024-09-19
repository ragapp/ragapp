import {
  AgentConfigType,
  DEFAULT_AGENT_CONFIG_SYSTEM_PROMPT_TEMPLATE,
} from "@/client/agent";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ToolsConfig } from "./ToolsConfig";

export const AgentTabContent = ({
  agent,
  form,
  handleSaveChanges,
}: {
  agent: AgentConfigType;
  form: UseFormReturn<AgentConfigType>;
  handleSaveChanges: () => Promise<boolean>;
}) => {
  const [useCustomSystemPromptTemplate, setUseCustomSystemPromptTemplate] =
    useState(false);

  const handleInputBlur = async () => {
    await handleSaveChanges();
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

  useEffect(() => {
    setUseCustomSystemPromptTemplate(
      form.getValues("system_prompt_template") !== null,
    );
  }, [form]);

  const handleUseCustomSystemPromptTemplate = async (checked: boolean) => {
    if (checked) {
      form.setValue(
        "system_prompt_template",
        DEFAULT_AGENT_CONFIG_SYSTEM_PROMPT_TEMPLATE,
      );
      await handleSaveChanges();
      setUseCustomSystemPromptTemplate(true);
    } else {
      form.setValue("system_prompt_template", null);
      await handleSaveChanges();
      setUseCustomSystemPromptTemplate(false);
    }
  };

  return (
    <TabsContent
      key={agent.agent_id}
      value={agent.agent_id}
      className="p-4 pt-2 rounded-md border"
    >
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(handleSaveChanges)}
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={handleInputBlur}
                      placeholder="Enter agent name"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Role
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={-1}>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            A short role name for the agent. Useful for deliver
                            right tasks to the agent.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={handleInputBlur}
                      placeholder="Enter agent role"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="backstory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Backstory
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={-1}>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Define the agent&apos;s background and
                            characteristics.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} onBlur={handleInputBlur} rows={3} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Goal
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={-1}>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Define the agent&apos;s primary objective. Useful
                            for deliver right tasks to the agent.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} onBlur={handleInputBlur} rows={3} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="ml-2 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={useCustomSystemPromptTemplate}
                onCheckedChange={(checked) =>
                  handleUseCustomSystemPromptTemplate(checked === true)
                }
              />
              <span>Use custom system prompt</span>
            </div>
            {useCustomSystemPromptTemplate && (
              <FormField
                control={form.control}
                name="system_prompt_template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      System Prompt Template
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        onBlur={handleInputBlur}
                        rows={3}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {`This prompt will be used to generate the system prompt for the agent. Use the {role}, {backstory}, and {goal} variables to use the values from the agent config.`}
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}
          </div>
          <ToolsConfig form={form} handleSaveChanges={handleSaveChanges} />
        </form>
      </Form>
    </TabsContent>
  );
};
