import { AgentConfigType } from "@/client/agent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, X } from "lucide-react";
import { useState } from "react";
import { RemoveAgentDialog } from "./RemoveAgentDialog";

export const AgentTabList = (
  {
    agents,
    removeAgent,
    addNewAgent,
    updateAgentName,
  }: {
    agents: AgentConfigType[];
    activeAgent: string | null;
    removeAgent: (agentId: string) => void;
    addNewAgent: () => void;
    updateAgentName: (agentId: string, newName: string) => void;
  }
) => {
  const sortedAgents = [...agents].sort((a, b) => {
    return a.created_at - b.created_at;
  });

  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  const handleEditName = (agent: AgentConfigType) => {
    setEditingAgentId(agent.agent_id);
    setEditedName(agent.name);
  };

  const handleSaveName = (agentId: string) => {
    const trimmedName = editedName.trim();
    if (trimmedName !== "") {
      updateAgentName(agentId, trimmedName);
      setEditingAgentId(null);
    } else {
      toast({
        title: "Invalid Name",
        description: "Agent name cannot be empty.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, agentId: string) => {
    if (e.key === "Enter") {
      handleSaveName(agentId);
    } else if (e.key === "Escape") {
      setEditingAgentId(null);
    }
  };

  return (
    <div className="relative z-10 mb-[-1rem] flex justify-start">
      <TabsList className="inline-flex h-auto items-center justify-center rounded-md flex-wrap shadow-sm">
        {sortedAgents.length > 1
          ? sortedAgents.map((agent) => (
              <TabsTrigger
                key={agent.agent_id}
                value={agent.agent_id}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-input hover:bg-accent hover:text-accent-foreground relative group px-3 py-1.5"
              >
                {editingAgentId === agent.agent_id ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={() => handleSaveName(agent.agent_id)}
                    onKeyDown={(e) => handleKeyDown(e, agent.agent_id)}
                    className="w-24 h-6 px-1 py-0 text-sm"
                    autoFocus
                  />
                ) : (
                  <span onClick={() => handleEditName(agent)}>
                    {agent.name}
                  </span>
                )}
                {sortedAgents.length > 1 && (
                  <RemoveAgentDialog
                    agentName={agent.name}
                    onRemove={() => removeAgent(agent.agent_id)}
                  >
                    <span className="absolute -top-1 -right-1 bg-background border border-input hover:bg-accent hover:text-accent-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <X size={12} />
                    </span>
                  </RemoveAgentDialog>
                )}
              </TabsTrigger>
            ))
          : null}
        <Button
          onClick={addNewAgent}
          variant="outline"
          size="sm"
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium border border-input hover:bg-accent hover:text-accent-foreground px-3 py-1.5 ${
            sortedAgents.length > 1 ? "ml-2" : ""
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          {sortedAgents.length > 1 ? null : (
            <span className="ml-1">Add Agent</span>
          )}
        </Button>
      </TabsList>
    </div>
  );
};
