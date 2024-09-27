import {
  defaultRAGAppFormValues,
  ragappFormSchema,
  RAGAppFormType,
} from "@/client/models/service";
import { createRAGAppService } from "@/client/service";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

function CreateAgentForm({ form }: { form: UseFormReturn<RAGAppFormType> }) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          await createRAGAppService(data);
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RAGapp name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Specify the name of the RAGapp</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="connectToExternalData"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormControl>
                  <Input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel className="ms-2">Connect to External Data</FormLabel>
              </div>

              <FormDescription>
                Specify if the RAGapp connects to external data.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("connectToExternalData") && (
          <>
            <FormField
              control={form.control}
              name="s3BucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>S3 Bucket Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Enter the S3 bucket name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="s3AccessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>S3 Access Key</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Enter the S3 access key.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="s3SecretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>S3 Secret Key</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Enter the S3 secret key.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="s3Url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>S3 URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Enter the S3 URL.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </form>
    </Form>
  );
}

export function CreateAgentDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const form = useForm<RAGAppFormType>({
    resolver: zodResolver(ragappFormSchema),
    defaultValues: defaultRAGAppFormValues,
  });

  const onSubmit = async (data: RAGAppFormType) => {
    await createRAGAppService(data);
    setOpen(false);
  };

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
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add App</DialogTitle>
          <DialogDescription>Add a new RAGapp to the system</DialogDescription>
        </DialogHeader>
        <CreateAgentForm form={form} />
        <DialogFooter>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            Add App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
