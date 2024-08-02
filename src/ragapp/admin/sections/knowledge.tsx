import {
  LlamaCloudConfigFormType,
  getLlamaCloudConfig,
  updateLlamaCloudConfig,
} from "@/client/llamacloud";
import { Button } from "@/components/ui/button";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Edit, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { KnowledgeFileSection } from "./config/fileLoader";
import {
  LlamaCloudConfigDialog,
  LlamaCloudConfigForm,
} from "./config/llamacloud";

export const Knowledge = () => {
  const { toast } = useToast();
  const [llamacloudDialogOpen, setLlamacloudDialogOpen] = useState(false);
  const { data: llamacloudConfig, refetch } = useQuery(
    "LlamaCloudConfig",
    getLlamaCloudConfig,
    {
      refetchOnWindowFocus: false,
    },
  );
  const { mutate: updateLlamaCloudConfigMutate } = useMutation(
    updateLlamaCloudConfig,
    {
      onError: (error: unknown) => {
        console.error(error);
        toast({
          title: "Failed to update LlamaCloud config",
          variant: "destructive",
        });
        form.reset();
      },
      onSuccess: (_data, body) => {
        setLlamacloudDialogOpen(false);
        refetch();
        toast({
          title: `Successfully ${body.use_llama_cloud ? "connected" : "disconnected"} LlamaCloud`,
        });
      },
    },
  );
  const form = useForm<LlamaCloudConfigFormType>({ values: llamacloudConfig });
  const useLlamaCloud = !!llamacloudConfig?.use_llama_cloud;

  const onSwitchKnowledge = (checked: boolean) => {
    if (checked) {
      setLlamacloudDialogOpen(true);
    } else {
      updateLlamaCloudConfigMutate({
        ...llamacloudConfig,
        use_llama_cloud: false,
      });
    }
  };

  return (
    <ExpandableSection
      name="knowledge"
      title={"Knowledge"}
      description="Manage your own data to chat with. You can consider using LlamaCloud for hosting your data."
      open
    >
      <div className="flex items-center space-x-2">
        <Switch
          checked={useLlamaCloud}
          onCheckedChange={onSwitchKnowledge}
          id="use-llamacloud"
        />
        <Label htmlFor="use-llamacloud">Use LlamaCloud</Label>
      </div>
      {useLlamaCloud && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-lg">LlamaCloud Config</h4>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setLlamacloudDialogOpen(true)}
            >
              Edit Configuration
              <Edit className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <LlamaCloudConfigForm form={form} viewOnly />
          <Button
            asChild
            className="bg-green-500 hover:bg-green-600 mt-2"
            size="sm"
          >
            <a href="https://cloud.llamaindex.ai" target="_blank">
              Configure Data Sources <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      )}
      <LlamaCloudConfigDialog
        open={llamacloudDialogOpen}
        setOpen={setLlamacloudDialogOpen}
        defaultConfig={llamacloudConfig}
        updateConfig={updateLlamaCloudConfigMutate}
      />
      {!useLlamaCloud && <KnowledgeFileSection />}
    </ExpandableSection>
  );
};
