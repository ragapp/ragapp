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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
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
            <FormField
              control={form.control}
              name="openapi"
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
                        if (
                          (checked &&
                            form.getValues().openapi.config.openapi_uri) ||
                          !checked
                        ) {
                          onSubmit(field.value.name, form.getValues().openapi);
                        }
                      }}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="font-normal">
                      {field.value.label}
                    </FormLabel>
                    <FormDescription>{field.value.description}</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {form.getValues().openapi.enabled && (
              <div className="flex flex-col space-y-4 pl-6">
                <FormField
                  control={form.control}
                  name="openapi.config.openapi_uri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL to OpenAPI spec (*)</FormLabel>
                      <FormControl
                        onBlur={() => {
                          form.trigger("openapi.config").then((value) => {
                            if (value) {
                              onSubmit(
                                form.getValues().openapi.name,
                                form.getValues().openapi,
                              );
                            }
                          });
                        }}
                      >
                        <Input
                          {...field}
                          placeholder="https://example.com/openapi.yaml"
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        The URL to the OpenAPI specification file (YAML or
                        JSON).
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </form>
      </Form>
    </ExpandableSection>
  );
};
