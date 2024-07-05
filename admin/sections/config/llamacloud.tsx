import {
  LlamaCloudConfig,
  LlamaCloudConfigFormType,
  LlamaCloudConfigSchema,
} from "@/client/llamacloud";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { UseFormReturn, useForm } from "react-hook-form";

export function LlamaCloudConfigDialog({
  open,
  setOpen,
  defaultConfig,
  updateConfig,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultConfig?: LlamaCloudConfig;
  updateConfig: (data: Partial<LlamaCloudConfig>) => void;
}) {
  const form = useForm<LlamaCloudConfigFormType>({
    resolver: zodResolver(LlamaCloudConfigSchema),
    values: defaultConfig,
  });
  const connectLlamaCloud = () => {
    updateConfig({
      ...form.getValues(),
      use_llama_cloud: true,
    });
  };
  const isDisabled = !form.formState.isValid;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          form.reset();
        }
      }}
    >
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
          <Button disabled={isDisabled} onClick={connectLlamaCloud}>
            Connect LLamaCloud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LlamaCloudConfigForm({
  viewOnly,
  form,
}: {
  viewOnly?: boolean;
  form: UseFormReturn<
    Omit<LlamaCloudConfig, "use_llama_cloud">,
    any,
    undefined
  >;
}) {
  return (
    <div className="mt-4">
      <Form {...form}>
        <form className="space-y-4 mb-2">
          <FormField
            disabled={viewOnly}
            control={form.control}
            name="llama_cloud_index_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Index Name (*)</FormLabel>
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
            disabled={viewOnly}
            control={form.control}
            name="llama_cloud_project_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name (*)</FormLabel>
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
            disabled={viewOnly}
            control={form.control}
            name="llama_cloud_api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key (*)</FormLabel>
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
