import {
  AgentConfigSchema,
  AgentConfigType,
  DEFAULT_AGENT_CONFIG,
  checkSupportedModel,
  createAgent,
  deleteAgent,
  getAgents,
  updateAgent,
} from "@/client/agent";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AgentTabContent } from "./agents/AgentTabContent";
import { AgentTabList } from "./agents/AgentTabList";
import { CreateAgentPopup } from "./agents/CreateAgentPopup";

export const AgentConfig = () => {
  const queryClient = useQueryClient();
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentConfigType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateAgentPopupOpen, setIsCreateAgentPopupOpen] = useState(false);

  const { data: fetchedAgents = [], isLoading: isLoadingAgents } = useQuery(
    "agents",
    getAgents,
    {
      onSuccess: (data) => {
        const sortedAgents = [...data].sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateA.getTime() - dateB.getTime();
        });
        setAgents(sortedAgents);
        if (!activeAgent && sortedAgents.length > 0) {
          setActiveAgent(sortedAgents[0].agent_id);
        }
      },
    },
  );

  const { mutateAsync: createAgentMutation } = useMutation(createAgent, {
    onMutate: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
    onSuccess: (newAgent: AgentConfigType) => {
      queryClient.invalidateQueries("agents"); // Invalidate the agents query to refetch
      setActiveAgent(newAgent.agent_id);
      setAgents((prevAgents) => [...prevAgents, newAgent]);
    },
  });

  const { mutateAsync: updateAgentMutation } = useMutation(
    ({ agentId, data }: { agentId: string; data: AgentConfigType }) =>
      updateAgent(agentId, data),
    {
      onMutate: () => setIsSubmitting(true),
      onSettled: () => {
        setIsSubmitting(false);
        queryClient.invalidateQueries("agents");
      },
      onError: (error: Error) => {
        console.error("Mutation error:", error);
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
      form.reset(currentAgent);
    }
  }, [activeAgent, agents, form]);

  const handleSaveChanges = async (): Promise<boolean> => {
    const data = form.getValues();
    if (activeAgent) {
      try {
        await updateAgentMutation({ agentId: activeAgent, data });
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  const addNewAgent = (templateAgent: AgentConfigType) => {
    let agentName = templateAgent.name;
    const agentNameExists = agents.some((agent) => agentName === agent.name);
    if (agentNameExists) {
      agentName = `${templateAgent.name}_${agents.length + 1}`;
    } else {
      agentName = templateAgent.name;
    }
    const newAgentConfig: AgentConfigType = {
      ...templateAgent,
      agent_id: crypto.randomUUID(),
      name: agentName,
      created_at: Math.floor(Date.now() / 1000),
    };
    createAgentMutation(newAgentConfig, {
      onSuccess: (newAgent) => {
        setActiveAgent(newAgent.agent_id);
        queryClient.invalidateQueries("agents");
      },
    });
    setIsCreateAgentPopupOpen(false);
  };

  const removeAgent = (agentId: string) => {
    deleteAgentMutation(agentId, {
      onSuccess: () => {
        setAgents((prevAgents) => {
          const updatedAgents = prevAgents.filter(
            (a) => a.agent_id !== agentId,
          );

          if (activeAgent === agentId) {
            const newActiveAgent = updatedAgents[0]?.agent_id || null;
            setActiveAgent(newActiveAgent);
          }

          return updatedAgents;
        });

        queryClient.invalidateQueries("agents");
      },
    });
  };

  const updateAgentName = async (agentId: string, newName: string) => {
    const agentToUpdate = agents.find((agent) => agent.agent_id === agentId);
    if (agentToUpdate) {
      const updatedAgent = { ...agentToUpdate, name: newName };
      try {
        await updateAgentMutation({ agentId, data: updatedAgent });
      } catch (error) {
        console.error("Failed to update agent name:", error);
        toast({
          title: "Error",
          description: `Failed to update agent name. ${error}`,
          variant: "destructive",
          duration: 10000,
        });
      }
    }
  };

  const { data: isMultiAgentSupported, isLoading: isCheckingSupport } =
    useQuery("checkSupportedModel", checkSupportedModel, {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    });

  const isLoading = isLoadingAgents || isCheckingSupport || isSubmitting;

  const handleTabChange = async (newTabValue: string) => {
    if (activeAgent && activeAgent !== newTabValue) {
      if (isSubmitting) return; // Prevent multiple submissions
      setIsSubmitting(true);
      const saveSuccess = await handleSaveChanges(); // Reset loading state
      setIsSubmitting(false);
      if (saveSuccess) {
        setActiveAgent(newTabValue);
        // Fetch the latest data for the new active agent
        const newAgentData = await getAgents();
        setAgents(newAgentData);
      } else {
        toast({
          title: "Error",
          description:
            "Failed to save changes. Please correct any errors before switching tabs.",
          variant: "destructive",
        });
      }
    } else {
      setActiveAgent(newTabValue);
    }
  };

  return (
    <ExpandableSection
      name="agent-config"
      title="Agents"
      description="Configure tools and agents"
      isLoading={isLoading}
      openByDefault={true}
    >
      {isLoadingAgents || isCheckingSupport ? (
        <div className="flex justify-center items-center h-16">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <Tabs
            value={activeAgent || undefined}
            onValueChange={handleTabChange}
          >
            {isMultiAgentSupported ? (
              <AgentTabList
                agents={agents}
                activeAgent={activeAgent}
                removeAgent={removeAgent}
                addNewAgent={() => setIsCreateAgentPopupOpen(true)}
                updateAgentName={updateAgentName}
              />
            ) : null}
            {agents.map((agent) => (
              <AgentTabContent
                key={agent.agent_id}
                agent={agent}
                form={form}
                handleSaveChanges={handleSaveChanges}
              />
            ))}
          </Tabs>
          <CreateAgentPopup
            isOpen={isCreateAgentPopupOpen}
            onClose={() => setIsCreateAgentPopupOpen(false)}
            onCreateAgent={addNewAgent}
          />
        </>
      )}
    </ExpandableSection>
  );
};
