import { AgentConfigType, getAgentTemplates } from "@/client/agent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface CreateAgentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (templateAgent: AgentConfigType) => void;
}

export const CreateAgentPopup: React.FC<CreateAgentPopupProps> = ({
  isOpen,
  onClose,
  onCreateAgent,
}) => {
  const [agentTemplates, setAgentTemplates] = useState<AgentConfigType[]>([]);

  useEffect(() => {
    if (isOpen) {
      getAgentTemplates().then(setAgentTemplates);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>
          <DialogDescription>
            Select a template to create a new agent.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {agentTemplates.map((template) => (
            <div
              key={template.name}
              className="p-4 border rounded-md flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{template.role}</h3>
                <p className="text-sm text-gray-600">{template.goal}</p>
              </div>
              <Button onClick={() => onCreateAgent(template)}>Create</Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
