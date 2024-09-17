import { AgentConfigType } from "@/client/agent";
import { DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG } from "@/client/tools/image_generator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

export const ImageGeneratorConfig = ({
  form,
  handleSaveChanges,
}: {
  form: UseFormReturn<AgentConfigType>;
  handleSaveChanges: () => void;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isEnabled = form.watch("tools.ImageGenerator.enabled");
  const apiKey = form.watch("tools.ImageGenerator.config.api_key");
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      // When component mounts, if tool is enabled and API Key is empty, show advanced config
      if (isEnabled && !apiKey) {
        setShowAdvanced(true);
      }
      mountedRef.current = true;
    }
  }, [isEnabled, apiKey]); // Include isEnabled and apiKey to satisfy the linter

  const handleInputBlur = () => {
    const checked = form.getValues("tools.ImageGenerator.enabled");
    if (checked) {
      form.trigger("tools.ImageGenerator.config.api_key").then((isValid) => {
        if (isValid && apiKey) {
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
    form.setValue("tools.ImageGenerator.enabled", checked);
    if (checked && !apiKey) {
      setShowAdvanced(true);
      form.setError("tools.ImageGenerator.config.api_key", {
        type: "manual",
        message: "API Key is required to enable this tool",
      });
    } else if (!checked) {
      form.clearErrors("tools.ImageGenerator.config.api_key");
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
        name="tools.ImageGenerator.enabled"
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
                <FormLabel className="font-normal">Image Generator</FormLabel>
              </div>
              {isEnabled && apiKey && (
                <Settings
                  className="h-4 w-4 cursor-pointer text-gray-500"
                  onClick={toggleAdvanced}
                />
              )}
            </div>
            <FormDescription className="text-xs">
              {DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG.description}
            </FormDescription>
          </FormItem>
        )}
      />
      {(showAdvanced || (isEnabled && !apiKey)) && (
        <div className="flex flex-col space-y-4 pt-4">
          <FormField
            control={form.control}
            name="tools.ImageGenerator.config.api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key (*)</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    value={field.value ?? ""}
                    placeholder="API Key"
                    onBlur={handleInputBlur}
                    className={cn(
                      form.formState.errors.tools?.ImageGenerator?.config
                        ?.api_key && "border-red-500",
                    )}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Get the Stability AI API Key from{" "}
                  <a
                    href="https://platform.stability.ai/account/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="break-words overflow-wrap-anywhere"
                  >
                    https://platform.stability.ai/account/keys
                  </a>
                </FormDescription>
                <FormMessage>
                  {
                    form.formState.errors.tools?.ImageGenerator?.config?.api_key
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
