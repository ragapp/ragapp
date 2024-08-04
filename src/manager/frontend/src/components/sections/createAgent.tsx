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
