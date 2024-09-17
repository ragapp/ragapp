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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: fetchedAgents = [], isLoading: isLoadingAgents } = useQuery(
    "agents",
    getAgents,
    {
      onSuccess: (data) => {
        // Sort agents by creation time
        const sortedAgents = [...data].sort((a, b) => {
          const dateA =
            a.created_at instanceof Date
              ? a.created_at
              : new Date(a.created_at);
          const dateB =
            b.created_at instanceof Date
              ? b.created_at
              : new Date(b.created_at);
          return dateA.getTime() - dateB.getTime();
        });
        setAgents(sortedAgents);
        if (!activeAgent && sortedAgents.length > 0) {
          setActiveAgent(sortedAgents[0].agent_id);
        }
      },
    },
  );

  const { mutate: createAgentMutation } = useMutation(createAgent, {
    onMutate: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
    onSuccess: (newAgent: AgentConfigType) => {
      queryClient.invalidateQueries("agents");
      setActiveAgent(newAgent.agent_id);
      setAgents((prevAgents) => [...prevAgents, newAgent]);
    },
  });

  const { mutate: updateAgentMutation } = useMutation(
    ({ agentId, data }: { agentId: string; data: AgentConfigType }) =>
      updateAgent(agentId, data),
    {
      onMutate: () => setIsSubmitting(true),
      onSettled: () => setIsSubmitting(false),
      onSuccess: (updatedAgent) => {
        queryClient.invalidateQueries("agents");
        setAgents((prevAgents) =>
          prevAgents.map((a) =>
            a.agent_id === updatedAgent.agent_id ? updatedAgent : a,
          ),
        );
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

  const handleSaveChanges = async () => {
    const data = form.getValues();
    if (activeAgent) {
      updateAgentMutation({ agentId: activeAgent, data });
    }
  };

  const addNewAgent = () => {
    const newAgentName = `Unnamed Agent ${agents.length + 1}`;
    const newAgentConfig: AgentConfigType = {
      ...DEFAULT_AGENT_CONFIG,
      agent_id: crypto.randomUUID(),
      name: newAgentName,
    };
    createAgentMutation(newAgentConfig);
  };

  const removeAgent = (agentId: string) => {
    deleteAgentMutation(agentId, {
      onSuccess: () => {
        // Update local state immediately
        setAgents((prevAgents) => {
          const updatedAgents = prevAgents.filter(
            (a) => a.agent_id !== agentId,
          );

          // If we're removing the active agent, select a new one
          if (activeAgent === agentId) {
            const newActiveAgent = updatedAgents[0]?.agent_id || null;
            setActiveAgent(newActiveAgent);
          }

          return updatedAgents;
        });

        // Refetch agents to ensure sync with server
        queryClient.invalidateQueries("agents");
      },
    });
  };

  const { data: isMultiAgentSupported, isLoading: isCheckingSupport } =
    useQuery("checkSupportedModel", checkSupportedModel, {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    });

  const isLoading = isLoadingAgents || isCheckingSupport || isSubmitting;

  const handleTabChange = async (newTabValue: string) => {
    if (activeAgent && activeAgent !== newTabValue) {
      await handleSaveChanges();
    }
    setActiveAgent(newTabValue);
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
        <Tabs value={activeAgent || undefined} onValueChange={handleTabChange}>
          {isMultiAgentSupported ? (
            <AgentTabList
              agents={agents}
              activeAgent={activeAgent}
              removeAgent={removeAgent}
              addNewAgent={addNewAgent}
              isPrimary={agents.length === 1}
            />
          ) : null}
          {agents.map((agent) => (
            <AgentTabContent
              key={agent.agent_id}
              agent={agent}
              form={form}
              handleSaveChanges={handleSaveChanges}
              isPrimary={!isMultiAgentSupported || agents.length === 1}
            />
          ))}
        </Tabs>
      )}
    </ExpandableSection>
  );
};
