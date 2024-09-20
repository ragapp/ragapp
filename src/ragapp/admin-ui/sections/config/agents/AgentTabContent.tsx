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
  FormMessage,
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
import { toast } from "@/components/ui/use-toast";
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
    await handleFormSubmit();
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // Only trigger validation for role and goal fields
    const isValid = await form.trigger(["role", "goal"]);
    if (isValid) {
      await handleSaveChanges();
    } else {
      // Show error toast
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
        duration: 5000,
      });
    }
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
    setUseCustomSystemPromptTemplate(form.getValues("system_prompt") !== null);
  }, [form]);

  const handleUseCustomSystemPromptTemplate = async (checked: boolean) => {
    if (checked) {
      form.setValue(
        "system_prompt",
        DEFAULT_AGENT_CONFIG_SYSTEM_PROMPT_TEMPLATE,
      );
      await handleSaveChanges();
      setUseCustomSystemPromptTemplate(true);
    } else {
      form.setValue("system_prompt", null);
      await handleSaveChanges();
      setUseCustomSystemPromptTemplate(false);
    }
  };

  return (
    <TabsContent
      key={agent.agent_id}
      value={agent.agent_id}
      className="p-4 pt-4 rounded-md border"
    >
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(handleSaveChanges)}
        >
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex flex-col h-full">
                  <FormLabel className="flex items-center gap-2">
                    Role *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={-1}>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            A short role name for the agent. Required to select
                            the right agent for a task.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl className="flex-grow">
                    <Input
                      {...field}
                      onBlur={handleInputBlur}
                      placeholder="Enter agent role"
                      className="h-full"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="backstory"
              render={({ field }) => (
                <FormItem className="flex flex-col h-full">
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
                            The agent&apos;s background story and
                            characteristics.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl className="flex-grow">
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      onBlur={handleInputBlur}
                      rows={3}
                      className="h-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem className="flex flex-col h-full">
                  <FormLabel className="flex items-center gap-2">
                    Goal *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={-1}>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            The agent&apos;s primary objective. Required to
                            select the right agent for a task.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl className="flex-grow">
                    <Textarea
                      {...field}
                      onBlur={handleInputBlur}
                      rows={3}
                      className="h-full"
                      required
                    />
                  </FormControl>
                  <FormMessage />
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
              <span className="text-sm">Use custom system prompt</span>
            </div>
            {useCustomSystemPromptTemplate && (
              <FormField
                control={form.control}
                name="system_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        onBlur={handleInputBlur}
                        rows={3}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {`This prompt will be used to generate the system prompt for the agent. You can use {role}, {backstory}, and {goal} to reference the values defined above.`}
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
