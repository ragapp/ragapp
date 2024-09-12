import { AgentConfigType } from "@/client/agent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { TabsContent } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { ToolsConfig } from "./ToolsConfig";

export const AgentTabContent = ({
    agent,
    form,
    isNewAgent,
    handleSaveChanges,
}: {
    agent: AgentConfigType;
    form: UseFormReturn<AgentConfigType>;
    isNewAgent: boolean;
    handleSaveChanges: () => void;
}) => (
    <TabsContent key={agent.agent_id} value={agent.agent_id} className="p-4 pt-8 rounded-md border">
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveChanges();
                }}
                className="space-y-6"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Agent Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
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
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                Define the role of this agent. It&apos;s used to help
                                orchestrator assign right tasks to the agent.
                            </FormDescription>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="system_prompt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>System Prompt</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormDescription>
                                Define the responsibilities and behaviors of the
                                assistant.
                            </FormDescription>
                        </FormItem>
                    )}
                />

                <ToolsConfig form={form} isPrimary={false} />

                <Button type="submit">
                    {isNewAgent ? "Create Agent" : "Save Changes"}
                </Button>
            </form>
        </Form>
    </TabsContent>
);
