import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "@/components/ui/input"
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogDescription } from "@radix-ui/react-dialog";
import { defaultRAGAppFormValues, ragappFormSchema, RAGAppFormType } from "@/client/models/service";
import { createRAGAppService } from "@/client/service";
import { Button } from "../ui/button";

function CreateAgentForm({
    form
}: {
    form: UseFormReturn<RAGAppFormType>
}) {
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
                            <FormLabel>Agent name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                Specify the name of the agent
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Agent image</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                Specify docker image for the agent, recommended to use the default image
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}

export function CreateAgentDialog({
    open,
    setOpen
}: {
    open: boolean,
    setOpen: (open: boolean) => void
}) {
    const form = useForm<RAGAppFormType>({
        resolver: zodResolver(ragappFormSchema),
        defaultValues: defaultRAGAppFormValues
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
                    <DialogTitle>Add Agent</DialogTitle>
                    <DialogDescription>
                        Add a new agent to the system
                    </DialogDescription>
                </DialogHeader>
                <CreateAgentForm form={form} />
                <DialogFooter>
                    <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Add Agent</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
