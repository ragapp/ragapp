import {
  DEFAULT_TOOL_CONFIG,
  ToolConfigSchema,
  getToolsConfig,
  updateToolConfig,
} from "@/client/tool";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export const ToolConfig = () => {
  const form = useForm({
    resolver: zodResolver(ToolConfigSchema),
    defaultValues: DEFAULT_TOOL_CONFIG,
  });

  const onSubmit = async (tool_name: string, data: any) => {
    await updateToolConfig(tool_name, data).catch((error) => {
      toast({
        className: cn(
          "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500",
        ),
        title: `Could not update ${tool_name} config`,
      });
    });
  };

  useEffect(() => {
    getToolsConfig().then((data) => {
      form.reset(data);
    });
  }, [form]);

  return (
    <ExpandableSection
      title={"Agent Config"}
      description="Config tools and agent"
      open
    >
      <Form {...form}>
        <form className="space-y-4 mb-4">
          <div className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="duckduckgo"
              render={({ field }) => (
                <FormItem
                  key={field.value.name}
                  className="flex flex-row items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value.enabled}
                      onCheckedChange={(checked) => {
                        field.onChange({
                          ...field.value,
                          enabled: checked,
                        });
                        onSubmit(field.value.name, form.getValues().duckduckgo);
                      }}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="font-normal">
                      {field.value.label}
                    </FormLabel>
                    <FormMessage />
                    <FormDescription>{field.value.description}</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wikipedia"
              render={({ field }) => (
                <FormItem
                  key={field.value.name}
                  className="flex flex-row items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value.enabled}
                      onCheckedChange={(checked) => {
                        field.onChange({
                          ...field.value,
                          enabled: checked,
                        });
                        onSubmit(field.value.name, form.getValues().wikipedia);
                      }}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="font-normal">
                      {field.value.label}
                    </FormLabel>
                    <FormMessage />
                    <FormDescription>{field.value.description}</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </ExpandableSection>
  );
};
