import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { AgentConfigType } from "@/client/agent";
import { ImageGeneratorConfig } from "../tools/image_generator";
import { OpenAPIConfig } from "../tools/openapi";
import { E2BInterpreterConfig } from "../tools/interpreter";

interface ToolConfigProps {
  form: UseFormReturn<AgentConfigType>;
}

const SimpleSelection: React.FC<{ form: UseFormReturn<AgentConfigType>; toolName: string }> = ({ form, toolName }) => (
  <FormField
    control={form.control}
    name={`tools.${toolName}.enabled`}
    render={({ field }) => (
      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
        <FormControl>
          <Checkbox
            checked={field.value as boolean}
            onCheckedChange={field.onChange}
          />
        </FormControl>
        <FormLabel className="font-normal">{toolName}</FormLabel>
      </FormItem>
    )}
  />
);

export const ToolConfig: React.FC<ToolConfigProps> = ({ form }) => {
  const renderToolConfig = (toolName: string) => {
    switch (toolName) {
      case "ImageGenerator":
        return <ImageGeneratorConfig form={form} />;
      case "E2BInterpreter":
        return <E2BInterpreterConfig form={form} />;
      case "OpenAPI":
        return <OpenAPIConfig form={form} />;
      case "DuckDuckGo":
      case "Wikipedia":
        return <SimpleSelection form={form} toolName={toolName} />;
      default:
        return null;
    }
  };

  return (
    <>
      <h3 className="text-lg font-medium">Tools</h3>
      <div className="space-y-6">
        {Object.keys(form.watch("tools")).map((toolName) => (
          <div key={toolName}>{renderToolConfig(toolName)}</div>
        ))}
      </div>
    </>
  );
};