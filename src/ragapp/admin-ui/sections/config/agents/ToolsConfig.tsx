import { AgentConfigType } from "@/client/agent";
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
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { ImageGeneratorConfig } from "./tools/image_generator";
import { E2BInterpreterConfig } from "./tools/interpreter";
import { OpenAPIConfig } from "./tools/openapi";

export const TOOL_ORDER = [
  "QueryEngine",
  "DuckDuckGo",
  "Wikipedia",
  "OpenAPI",
  "Interpreter",
  "ImageGenerator",
];

interface ToolConfigProps {
  form: UseFormReturn<AgentConfigType>;
  isPrimary: boolean;
  handleSaveChanges: () => void;
}

const SimpleSelection: React.FC<{
  form: UseFormReturn<AgentConfigType>;
  toolName: string;
  toolConfig: { description: string };
  disabled?: boolean;
  handleSaveChanges: () => void;
}> = ({ form, toolName, toolConfig, disabled, handleSaveChanges }) => (
  <FormField
    control={form.control}
    name={`tools.${toolName}` as `tools.${keyof AgentConfigType['tools']}`}
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
              disabled={disabled}
            />
          </FormControl>
          <FormLabel className="font-normal">{toolName}</FormLabel>
        </div>
        <FormDescription className="text-xs">
          {toolConfig.description}
        </FormDescription>
      </FormItem>
    )}
  />
);

export const ToolsConfig: React.FC<ToolConfigProps> = ({ form, isPrimary, handleSaveChanges }) => {
  const tools = form.watch("tools");

  const renderToolConfig = (toolName: string) => {
    switch (toolName) {
      case "ImageGenerator":
        return <ImageGeneratorConfig form={form} handleSaveChanges={handleSaveChanges} />;
      case "Interpreter":
        return <E2BInterpreterConfig form={form} handleSaveChanges={handleSaveChanges} />;
      case "OpenAPI":
        return <OpenAPIConfig form={form} handleSaveChanges={handleSaveChanges} />;
      case "DuckDuckGo":
        return (
          <SimpleSelection
            form={form}
            toolName={toolName}
            toolConfig={DEFAULT_DUCKDUCKGO_TOOL_CONFIG}
            disabled={false}
            handleSaveChanges={handleSaveChanges}
          />
        );
      case "Wikipedia":
        return (
          <SimpleSelection
            form={form}
            toolName={toolName}
            toolConfig={DEFAULT_WIKIPEDIA_TOOL_CONFIG}
            disabled={false}
            handleSaveChanges={handleSaveChanges}
          />
        );
      case "QueryEngine":
        return (
          <SimpleSelection
            form={form}
            toolName={toolName}
            toolConfig={DEFAULT_QUERY_ENGINE_TOOL_CONFIG}
            disabled={isPrimary} // Disable for primary agent
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
        {TOOL_ORDER.map(
          (toolName) =>
            tools[toolName as keyof AgentConfigType['tools']] && (
              <div
                key={toolName}
                className={cn(
                  "p-4 border rounded-lg",
                  toolName === "QueryEngine" && isPrimary && "opacity-50", // Disable updating QueryEngine for primary agent
                )}
              >
                {renderToolConfig(toolName)}
              </div>
            ),
        )}
      </div>
    </>
  );
};
