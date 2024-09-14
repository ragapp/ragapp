import { AgentConfigType } from "@/client/agent";
import { DEFAULT_OPENAPI_TOOL_CONFIG, OpenAPIToolConfig } from "@/client/tools/openapi";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";

export const OpenAPIConfig = ({
  form,
  handleSaveChanges,
}: {
  form: UseFormReturn<AgentConfigType>;
  handleSaveChanges: () => void;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isEnabled = form.watch("tools.OpenAPI.enabled");
  const openApiUri = form.watch("tools.OpenAPI.config.openapi_uri");

  useEffect(() => {
    if (!isEnabled) {
      setShowAdvanced(false);
    } else if (!openApiUri) {
      setShowAdvanced(true);
    }
  }, [isEnabled, openApiUri]);

  const handleInputBlur = () => {
    form.trigger("tools.OpenAPI.config.openapi_uri").then((isValid) => {
      if (isValid && openApiUri) {
        handleSaveChanges();
      }
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    form.setValue("tools.OpenAPI.enabled", checked);
    if (checked) {
      setShowAdvanced(true);
      if (!openApiUri) {
        form.setError("tools.OpenAPI.config.openapi_uri", {
          type: "manual",
          message: "OpenAPI URI is required to enable this tool",
        });
      }
    } else {
      form.setValue("tools.OpenAPI.config.openapi_uri", "");
      form.clearErrors("tools.OpenAPI.config.openapi_uri");
      setShowAdvanced(false);
    }
    handleSaveChanges();
  };

  const toggleAdvanced = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAdvanced(!showAdvanced);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="tools.OpenAPI.enabled"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value as boolean}
                    onCheckedChange={handleCheckboxChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">OpenAPI</FormLabel>
              </div>
              {isEnabled && openApiUri && (
                <Settings
                  className="h-4 w-4 cursor-pointer text-gray-500"
                  onClick={toggleAdvanced}
                />
              )}
            </div>
            <FormDescription className="text-xs">
              {DEFAULT_OPENAPI_TOOL_CONFIG.description}
            </FormDescription>
            {isEnabled && !openApiUri && (
              <FormMessage>OpenAPI URI is required to enable this tool</FormMessage>
            )}
          </FormItem>
        )}
      />
      {isEnabled && (!openApiUri || showAdvanced) && (
        <div className="flex flex-col space-y-4 pt-4">
          <FormField
            control={form.control}
            name="tools.OpenAPI.config.openapi_uri"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL to OpenAPI spec</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com/openapi.yaml"
                    value={field.value as string}
                    onBlur={handleInputBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};
