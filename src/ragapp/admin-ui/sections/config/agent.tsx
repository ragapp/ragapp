import {
  AgentConfigSchema,
  AgentConfigType,
  DEFAULT_AGENT_CONFIG,
  createAgent,
  deleteAgent,
  getAgents,
  updateAgent,
} from "@/client/agent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";

const RemoveAgentDialog = ({
  agentName,
  onRemove,
  children,
}: {
  agentName: string;
  onRemove: () => void;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const handleRemove = () => {
    onRemove();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the agent
            configuration.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AgentConfig = () => {
  const queryClient = useQueryClient();
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentConfigType[]>([]);
  const [isNewAgent, setIsNewAgent] = useState(false);
  const { toast } = useToast();

  const { data: fetchedAgents = [], isLoading: isLoadingAgents } = useQuery(
    "agents",
    getAgents,
    {
      onSuccess: (data) => setAgents(data),
    },
  );

  const { mutate: createAgentMutation } = useMutation(createAgent, {
    onSuccess: (newAgent: AgentConfigType) => {
      queryClient.invalidateQueries("agents");
      setActiveAgent(newAgent.agent_id);
      setIsNewAgent(false);
      toast({
        title: "Agent Created",
        description: `${newAgent.name} has been successfully created.`,
        duration: 3000,
      });
      // Update the agents list with the new agent
      setAgents((prevAgents) => [
        ...prevAgents.filter((a) => a.agent_id !== "temp_id"),
        newAgent,
      ]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create agent: ${error}`,
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const { mutate: updateAgentMutation } = useMutation(
    ({
      agentId,
      data,
    }: {
      agentId: string;
      data: Omit<AgentConfigType, "agent_id">;
    }) => updateAgent(agentId, data),
    {
      onSuccess: (updatedAgent) => {
        queryClient.invalidateQueries("agents");
        toast({
          title: "Agent Updated",
          description: `${updatedAgent.name} has been successfully updated.`,
          duration: 3000,
        });
        // Update the agents list with the updated agent
        setAgents((prevAgents) =>
          prevAgents.map((a) =>
            a.agent_id === updatedAgent.agent_id ? updatedAgent : a,
          ),
        );
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update agent: ${error}`,
          variant: "destructive",
          duration: 3000,
        });
      },
    },
  );

  const { mutate: deleteAgentMutation } = useMutation(deleteAgent, {
    onSuccess: () => queryClient.invalidateQueries("agents"),
  });

  const form = useForm<Omit<AgentConfigType, "agent_id">>({
    resolver: zodResolver(AgentConfigSchema.omit({ agent_id: true })),
    defaultValues: DEFAULT_AGENT_CONFIG,
  });

  useEffect(() => {
    if (agents.length > 0 && !activeAgent) {
      setActiveAgent(agents[0].agent_id);
    }
  }, [agents, activeAgent]);

  useEffect(() => {
    const currentAgent = agents.find((agent) => agent.agent_id === activeAgent);
    if (currentAgent) {
      form.reset({
        name: currentAgent.name,
        system_prompt: currentAgent.system_prompt,
        tools: currentAgent.tools,
      });
    }
  }, [activeAgent, agents, form]);

  const handleSubmit = (data: Omit<AgentConfigType, "agent_id">) => {
    if (isNewAgent) {
      createAgentMutation(data);
    } else if (activeAgent) {
      updateAgentMutation({ agentId: activeAgent, data });
    }
  };

  const addNewAgent = () => {
    const newAgentName = `New Agent ${agents.length + 1}`;
    const newAgentConfig: Omit<AgentConfigType, "agent_id"> = {
      ...DEFAULT_AGENT_CONFIG,
      name: newAgentName,
    };
    setAgents([
      ...agents,
      { ...newAgentConfig, agent_id: "temp_id" } as AgentConfigType,
    ]);
    setActiveAgent("temp_id");
    setIsNewAgent(true);
    form.reset(newAgentConfig);
  };

  const removeAgent = (agentId: string) => {
    if (isNewAgent && agentId === activeAgent) {
      setAgents(agents.filter((agent) => agent.agent_id !== agentId));
      setActiveAgent(agents[0]?.agent_id || null);
      setIsNewAgent(false);
    } else {
      deleteAgentMutation(agentId);
    }
    if (activeAgent === agentId) {
      setActiveAgent(agents[0]?.agent_id || null);
    }
  };

  if (isLoadingAgents) {
    return <div>Loading...</div>;
  }

  return (
    <ExpandableSection
      name="agent-config"
      title="Agents Config"
      description="Configure tools and agents"
    >
      <Tabs value={activeAgent || undefined} onValueChange={setActiveAgent}>
        <div className="mb-4">
          <TabsList className="inline-flex h-auto items-center justify-center rounded-md bg-muted p-1 text-muted-foreground flex-wrap">
            {agents.map((agent) => (
              <TabsTrigger
                key={agent.agent_id}
                value={agent.agent_id}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-input m-1 hover:bg-accent hover:text-accent-foreground relative group"
              >
                {agent.name}
                {agent.agent_id !== "default" && agents.length > 1 && (
                  <RemoveAgentDialog
                    agentName={agent.name}
                    onRemove={() => removeAgent(agent.agent_id)}
                  >
                    <button className="absolute -top-1 -right-1 p-0.5 bg-background border border-input hover:bg-accent hover:text-accent-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </RemoveAgentDialog>
                )}
              </TabsTrigger>
            ))}
            <Button
              onClick={addNewAgent}
              variant="outline"
              size="sm"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium m-1 border border-input hover:bg-accent hover:text-accent-foreground"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </TabsList>
        </div>
        {agents.map((agent) => (
          <TabsContent key={agent.agent_id} value={agent.agent_id}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
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
                <h3 className="text-lg font-medium">Tools</h3>
                <div className="space-y-2">
                  {Object.entries(agent.tools).map(([toolName, toolConfig]) => (
                    <FormField
                      key={toolName}
                      control={form.control}
                      name={`tools.${toolName}.enabled`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(value) => field.onChange(value)}
                            />
                          </FormControl>
                          <div className="leading-none">
                            <FormLabel className="text-sm font-medium">
                              {toolName}
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Enable or disable the {toolName} tool
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button type="submit">
                  {agent.agent_id === "temp_id"
                    ? "Create Agent"
                    : "Save Changes"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        ))}
      </Tabs>
    </ExpandableSection>
  );
};
