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
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
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
import { RemoveAgentDialog } from "./agents/RemoveAgentDialog";
import { ToolConfig } from "./agents/ToolConfig";

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
    ({ agentId, data }: { agentId: string; data: AgentConfigType }) =>
      updateAgent(agentId, data),
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

  const form = useForm<AgentConfigType>({
    resolver: zodResolver(AgentConfigSchema),
    defaultValues: DEFAULT_AGENT_CONFIG as AgentConfigType,
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

  const handleSubmit = (data: AgentConfigType) => {
    if (isNewAgent) {
      const newAgentId = data.name.toLowerCase().replace(/\s+/g, "_");
      createAgentMutation({ ...data, agent_id: newAgentId } as AgentConfigType);
    } else if (activeAgent) {
      updateAgentMutation({ agentId: activeAgent, data });
    }
  };

  // Add this new function
  const handleSaveChanges = () => {
    handleSubmit(form.getValues());
  };

  const addNewAgent = () => {
    const newAgentName = `Unnamed Agent ${agents.length + 1}`;
    const newAgentConfig: AgentConfigType = {
      agent_id: `unnamed_${agents.length + 1}`,
      ...DEFAULT_AGENT_CONFIG,
      name: newAgentName,
    };
    setAgents([
      ...agents,
      {
        ...newAgentConfig,
        agent_id: `unnamed_${agents.length + 1}`,
      } as AgentConfigType,
    ]);
    setActiveAgent(`unnamed_${agents.length + 1}`);
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
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-input m-1 hover:bg-accent hover:text-accent-foreground relative group"
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
                <ToolConfig form={form} />
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
