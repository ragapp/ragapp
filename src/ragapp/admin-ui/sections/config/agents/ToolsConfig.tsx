import { UseFormReturn } from "react-hook-form";
import { AgentConfigType } from "@/client/agent";
import { ImageGeneratorConfig } from "../tools/image_generator";
import { E2BInterpreterConfig } from "../tools/interpreter";
import { OpenAPIConfig } from "../tools/openapi";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface ToolsConfigProps {
    form: UseFormReturn<AgentConfigType>;
}

const SimpleToolSelection = ({
    form,
    toolName,
}: {
    form: UseFormReturn<AgentConfigType>;
    toolName: string;
}) => {
    return (
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
};

export const ToolsConfig: React.FC<ToolsConfigProps> = ({ form }) => {
    const renderToolConfig = (toolName: string) => {
        switch (toolName) {
            case "ImageGenerator":
                return <ImageGeneratorConfig form={form} />;
            case "Interpreter":
                return <E2BInterpreterConfig form={form} />;
            case "OpenAPI":
                return <OpenAPIConfig form={form} />;
            case "DuckDuckGo":
            case "Wikipedia":
                return <SimpleToolSelection form={form} toolName={toolName} />;
            default:
                return null;
        }
    };

    return (
        <>
            <h3 className="text-lg font-medium">Tools</h3>
            <div className="space-y-6">
                {Object.keys(form.watch("tools")).map((toolName) => renderToolConfig(toolName))}
            </div>
        </>
    );
};