import { AgentConfigType } from "@/client/agent";
import { DEFAULT_E2B_INTERPRETER_TOOL_CONFIG, E2BInterpreterToolConfig } from "@/client/tools/interpreter";
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
import { UseFormReturn } from "react-hook-form";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const E2BInterpreterConfig = ({
  form,
  handleSaveChanges,
}: {
  form: UseFormReturn<AgentConfigType>;
  handleSaveChanges: () => void;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isEnabled = form.watch("tools.Interpreter.enabled");
  const apiKey = form.watch("tools.Interpreter.config.api_key");

  useEffect(() => {
    if (!isEnabled) {
      setShowAdvanced(false);
    } else if (!apiKey) {
      setShowAdvanced(true);
    }
  }, [isEnabled, apiKey]);

  const handleInputBlur = () => {
    form.trigger("tools.Interpreter.config.api_key").then((isValid) => {
      if (isValid && apiKey) {
        handleSaveChanges();
      }
    });
  };

  const toggleAdvanced = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAdvanced(!showAdvanced);
  };

  const handleCheckboxChange = (checked: boolean) => {
    form.setValue("tools.Interpreter.enabled", checked);
    if (checked) {
      setShowAdvanced(true);
      if (!apiKey) {
        form.setError("tools.Interpreter.config.api_key", {
          type: "manual",
          message: "API Key is required to enable this tool",
        });
      }
    } else {
      form.setValue("tools.Interpreter.config.api_key", "");
      form.clearErrors("tools.Interpreter.config.api_key");
      setShowAdvanced(false);
    }
    handleSaveChanges();
  };

  return (
    <>
      <FormField
        control={form.control}
        name="tools.Interpreter.enabled"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={handleCheckboxChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Code Interpreter</FormLabel>
              </div>
              {isEnabled && apiKey && (
                <Settings
                  className="h-4 w-4 cursor-pointer text-gray-500"
                  onClick={toggleAdvanced}
                />
              )}
            </div>
            <FormDescription className="text-xs">
              {DEFAULT_E2B_INTERPRETER_TOOL_CONFIG.description}
            </FormDescription>
          </FormItem>
        )}
      />
      {(isEnabled || showAdvanced) && (
        <div className="flex flex-col space-y-4 pt-4">
          <FormField
            control={form.control}
            name="tools.Interpreter.config.api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key (*)</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    value={field.value ?? ""}
                    placeholder="API Key"
                    onBlur={handleInputBlur}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  The E2B API Key to use for the interpreter tool. Get it here:{" "}
                  <a
                    href="https://e2b.dev/docs/getting-started/api-key"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://e2b.dev/docs/getting-started/api-key
                  </a>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};
