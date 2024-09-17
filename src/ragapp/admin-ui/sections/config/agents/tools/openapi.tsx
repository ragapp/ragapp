import { AgentConfigType } from "@/client/agent";
import { DEFAULT_OPENAPI_TOOL_CONFIG } from "@/client/tools/openapi";
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
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

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
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      // When component mounts, if tool is enabled and URI is empty, show advanced config
      if (isEnabled && !openApiUri) {
        setShowAdvanced(true);
      }
      mountedRef.current = true;
    }
  }, [isEnabled, openApiUri]); // Include isEnabled and openApiUri to satisfy the linter

  const handleInputBlur = () => {
    const checked = form.getValues("tools.OpenAPI.enabled");
    if (checked) {
      form.trigger("tools.OpenAPI.config.openapi_uri").then((isValid) => {
        if (isValid && openApiUri) {
          handleSaveChanges();
        }
      });
    } else {
      handleSaveChanges();
    }
  };

  const toggleAdvanced = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAdvanced(!showAdvanced);
  };

  const handleCheckboxChange = (checked: boolean) => {
    form.setValue("tools.OpenAPI.enabled", checked);
    if (checked && !openApiUri) {
      setShowAdvanced(true);
      form.setError("tools.OpenAPI.config.openapi_uri", {
        type: "manual",
        message: "OpenAPI URL is required to enable this tool",
      });
    } else if (!checked) {
      form.clearErrors("tools.OpenAPI.config.openapi_uri");
      setShowAdvanced(false);
      handleSaveChanges();
    } else {
      handleSaveChanges();
    }
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
          </FormItem>
        )}
      />
      {(showAdvanced || (isEnabled && !openApiUri)) && (
        <div className="flex flex-col space-y-4 pt-4">
          <FormField
            control={form.control}
            name="tools.OpenAPI.config.openapi_uri"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL to OpenAPI spec (*)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com/openapi.yaml"
                    value={field.value as string}
                    onBlur={handleInputBlur}
                    className={cn(
                      form.formState.errors.tools?.OpenAPI?.config
                        ?.openapi_uri && "border-red-500",
                    )}
                  />
                </FormControl>
                <FormMessage>
                  {
                    form.formState.errors.tools?.OpenAPI?.config?.openapi_uri
                      ?.message
                  }
                </FormMessage>
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};
