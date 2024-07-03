import { LlamaCloudConfig, updateLlamaCloudConfig } from "@/client/llamacloud";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/use-toast";
import { UseFormReturn, useForm } from "react-hook-form";
import { useMutation } from "react-query";

export function LlamaCloudConfigDialog({
  open,
  setOpen,
  defaultConfig,
  refetch,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultConfig?: LlamaCloudConfig;
  refetch: () => void;
}) {

  const form = useForm({
    values: defaultConfig,
  });

  const { mutate: updateConfig } = useMutation(
    updateLlamaCloudConfig,
    {
      onError: (error: unknown) => {
        console.error(error);
        toast({
          title: "Failed to update chat config",
          variant: "destructive",
        });
        form.reset();
      },
      onSuccess: () => {
        setOpen(false);
        refetch();
      },
    },
  );

  const handleSubmit = () => {
    updateConfig({
      ...form.getValues(),
      use_llama_cloud: true,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-green-500">
            Connect LlamaCloud
          </DialogTitle>
          <DialogDescription>
            Please provide the necessary information to connect to LlamaCloud.
          </DialogDescription>
        </DialogHeader>
        <LlamaCloudConfigForm form={form} />
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Connect LLamaCloud</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LlamaCloudConfigForm({
  viewOnly,
  // defaultConfig,
  form,
}: {
  viewOnly?: boolean;
  // defaultConfig?: LlamaCloudConfig;
  form: UseFormReturn<LlamaCloudConfig, any, undefined>;
}) {
  const isLoading = false;
  const isSuccess = true;

  // console.log({defaultConfig})

  return (
    <div className="mt-4">
      <Form {...form}>
        <form
          // onSubmit={handleSubmit}
          className="space-y-4 mb-2"
        >
          <FormField
            disabled={isLoading || viewOnly}
            control={form.control}
            name="llamacloud_index_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LlamaCloud Index Name (*)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  The name of the LlamaCloud index to use (part of the
                  LlamaCloud project)
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            disabled={isLoading || viewOnly}
            control={form.control}
            name="llamacloud_project_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LlamaCloud Project Name (*)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  The name of the LlamaCloud project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isLoading || viewOnly}
            control={form.control}
            name="llamacloud_api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Llamacloud API Key (*)</FormLabel>
                <FormControl>
                  <PasswordInput placeholder={"llx-xxx"} showCopy {...field} />
                </FormControl>
                <FormDescription>
                  Get your LlamaCloud API key from{" "}
                  <a href="https://cloud.llamaindex.ai/" target="_blank">
                    https://cloud.llamaindex.ai/
                  </a>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
