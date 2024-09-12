import {
  AgentConfigSchema,
  AgentConfigType,
  DEFAULT_AGENT_CONFIG,
  createAgent,
  deleteAgent,
  getAgents,
  updateAgent,
} from "@/client/agent";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AgentTabContent } from "./agents/AgentTabContent";
import { AgentTabList } from "./agents/AgentTabList";

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
        role: currentAgent.role, // Add this line
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

  return (
    <ExpandableSection
      name="agent-config"
      title="Agents Config"
      description="Configure tools and agents"
    >
      {isLoadingAgents ? (
        <div className="flex justify-center items-center h-16">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <Tabs value={activeAgent || undefined} onValueChange={setActiveAgent}>
          <AgentTabList
            agents={agents}
            activeAgent={activeAgent}
            isNewAgent={isNewAgent}
            removeAgent={removeAgent}
            addNewAgent={addNewAgent}
          />
          {agents.map((agent) => (
            <AgentTabContent
              key={agent.agent_id}
              agent={agent}
              form={form}
              isNewAgent={isNewAgent && agent.agent_id === activeAgent}
              handleSaveChanges={handleSaveChanges}
              isPrimary={agents.length === 1} // isPrimary is true when there's only one agent
            />
          ))}
        </Tabs>
      )}
    </ExpandableSection>
  );
};
