import { AgentConfigType } from "@/client/agent";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, X } from "lucide-react";
import { RemoveAgentDialog } from "./RemoveAgentDialog";


export const AgentTabList = ({
  agents,
  activeAgent,
  removeAgent,
  addNewAgent,
  isPrimary,
}: {
  agents: AgentConfigType[];
  activeAgent: string | null;
  removeAgent: (agentId: string) => void;
  addNewAgent: () => void;
  isPrimary: boolean;
}) => {
  const showOnlyAddButton = isPrimary && agents.length === 1;

  return (
    <div className="relative z-10 mb-[-1rem] flex justify-start">
      {showOnlyAddButton ? (
        <Button
          onClick={addNewAgent}
          variant="outline"
          size="sm"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium border border-input hover:bg-accent hover:text-accent-foreground px-3 py-1.5"
        >
          <PlusCircle className="h-4 w-4" />
          Add Agent
        </Button>
      ) : (
        <TabsList className="inline-flex h-auto items-center justify-center rounded-md flex-wrap shadow-sm">
          {agents.map((agent) => (
            <TabsTrigger
              key={agent.agent_id}
              value={agent.agent_id}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-input hover:bg-accent hover:text-accent-foreground relative group px-3 py-1.5"
            >
              {agent.name}
              {agent.agent_id !== "default" && agents.length > 1 && (
                <RemoveAgentDialog
                  agentName={agent.name}
                  onRemove={() => removeAgent(agent.agent_id)}
                >
                  <button className="absolute -top-1 -right-1 bg-background border border-input hover:bg-accent hover:text-accent-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
            className="inline-flex ml-2 items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium border border-input hover:bg-accent hover:text-accent-foreground px-3 py-1.5"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </TabsList>
      )}
    </div>
  );
};
