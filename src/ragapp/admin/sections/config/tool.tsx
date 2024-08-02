import {
  DEFAULT_TOOL_CONFIG,
  ToolConfigSchema,
  ToolConfigType,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ImageGeneratorConfig } from "./tools/image_generator";
import { E2BInterpreterConfig } from "./tools/interpreter";
import { OpenAPIConfig } from "./tools/openapi";

export const ToolConfig = () => {
  const form = useForm<ToolConfigType>({
    resolver: zodResolver(ToolConfigSchema),
    defaultValues: DEFAULT_TOOL_CONFIG,
  });

  const onSubmit = async (tool_name: string, data: any) => {
    await updateToolConfig(tool_name, data).catch((error) => {
      toast({
        title: `Could not update ${tool_name} config`,
        variant: "destructive",
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
      name="agent-config"
      title={"Agent Config"}
      description="Config tools and agent"
    >
      <Form {...form}>
        <form className="space-y-4 mb-4">
          <div className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="duckduckgo"
              render={({ field }) => (
                <FormItem
                  key="duckduckgo"
                  className="flex flex-row items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value.enabled ?? false}
                      onCheckedChange={(checked) => {
                        field.onChange({
                          ...field.value,
                          enabled: checked,
                        });
                        onSubmit("duckduckgo", form.getValues().duckduckgo);
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
                  key="wikipedia"
                  className="flex flex-row items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value.enabled ?? false}
                      onCheckedChange={(checked) => {
                        field.onChange({
                          ...field.value,
                          enabled: checked,
                        });
                        onSubmit("wikipedia", form.getValues().wikipedia);
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
            <OpenAPIConfig form={form} onSubmit={onSubmit} />
            <E2BInterpreterConfig form={form} onSubmit={onSubmit} />
            <ImageGeneratorConfig form={form} onSubmit={onSubmit} />
          </div>
        </form>
      </Form>
    </ExpandableSection>
  );
};
