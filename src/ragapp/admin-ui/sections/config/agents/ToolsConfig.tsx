import { AgentConfigType } from "@/client/agent";
import { DEFAULT_DOCUMENT_GENERATOR_TOOL_CONFIG } from "@/client/tools/document_generator";
import { DEFAULT_DUCKDUCKGO_TOOL_CONFIG } from "@/client/tools/duckduckgo";
import { DEFAULT_QUERY_ENGINE_TOOL_CONFIG } from "@/client/tools/query_engine";
import { DEFAULT_WIKIPEDIA_TOOL_CONFIG } from "@/client/tools/wikipedia";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CodeGeneratorConfig } from "./tools/code_generator";
import { ImageGeneratorConfig } from "./tools/image_generator";
import { E2BInterpreterConfig } from "./tools/interpreter";
import { OpenAPIConfig } from "./tools/openapi";

export const TOOL_ORDER = [
  "QueryEngine",
  "DuckDuckGo",
  "Wikipedia",
  "DocumentGenerator",
  "ImageGenerator",
  "OpenAPI",
  "Interpreter",
  "CodeGenerator",
];

interface ToolConfigProps {
  form: UseFormReturn<AgentConfigType>;
  handleSaveChanges: () => void;
}

const SimpleSelection: React.FC<{
  form: UseFormReturn<AgentConfigType>;
  toolName: string;
  toolConfig: { description: string; name: string; label: string };
  handleSaveChanges: () => void;
}> = ({ form, toolName, toolConfig, handleSaveChanges }) => (
  <FormField
    control={form.control}
    name={`tools.${toolName}` as `tools.${keyof AgentConfigType["tools"]}`}
    render={({ field }) => (
      <FormItem className="space-y-2">
        <div className="flex items-center space-x-2">
          <FormControl>
            <Checkbox
              checked={field.value?.enabled as boolean}
              onCheckedChange={(checked) => {
                field.onChange({ ...field.value, enabled: checked });
                handleSaveChanges();
              }}
            />
          </FormControl>
          <FormLabel className="font-normal">{toolConfig.label}</FormLabel>
        </div>
        <FormDescription className="text-xs">
          {toolConfig.description}
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const ToolsConfig: React.FC<ToolConfigProps> = ({
  form,
  handleSaveChanges,
}) => {
  const renderToolConfig = (toolId: string) => {
    switch (toolId) {
      case "ImageGenerator":
        return (
          <ImageGeneratorConfig
            form={form}
            handleSaveChanges={handleSaveChanges}
          />
        );
      case "Interpreter":
        return (
          <E2BInterpreterConfig
            form={form}
            handleSaveChanges={handleSaveChanges}
          />
        );
      case "CodeGenerator":
        return (
          <CodeGeneratorConfig
            form={form}
            handleSaveChanges={handleSaveChanges}
          />
        );
      case "OpenAPI":
        return (
          <OpenAPIConfig form={form} handleSaveChanges={handleSaveChanges} />
        );
      case "DuckDuckGo":
        return (
          <SimpleSelection
            form={form}
            toolName={toolId}
            toolConfig={DEFAULT_DUCKDUCKGO_TOOL_CONFIG}
            handleSaveChanges={handleSaveChanges}
          />
        );
      case "Wikipedia":
        return (
          <SimpleSelection
            form={form}
            toolName={toolId}
            toolConfig={DEFAULT_WIKIPEDIA_TOOL_CONFIG}
            handleSaveChanges={handleSaveChanges}
          />
        );
      case "QueryEngine":
        return (
          <SimpleSelection
            form={form}
            toolName={toolId}
            toolConfig={DEFAULT_QUERY_ENGINE_TOOL_CONFIG}
            handleSaveChanges={handleSaveChanges}
          />
        );
      case "DocumentGenerator":
        return (
          <SimpleSelection
            form={form}
            toolName={toolId}
            toolConfig={DEFAULT_DOCUMENT_GENERATOR_TOOL_CONFIG}
            handleSaveChanges={handleSaveChanges}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <h3 className="mb-4">Tools</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOL_ORDER.map((toolId) => {
          return (
            <div key={toolId} className="p-4 border rounded-lg">
              {renderToolConfig(toolId)}
            </div>
          );
        })}
      </div>
    </>
  );
};
