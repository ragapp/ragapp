import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface RemoveAgentDialogProps {
    agentName: string;
    onRemove: () => void;
    children: React.ReactNode;
}

export const RemoveAgentDialog = ({
    agentName,
    onRemove,
    children,
}: RemoveAgentDialogProps) => {
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
                    <DialogTitle>Are you sure to delete {agentName}?</DialogTitle>
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