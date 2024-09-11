import { AgentConfigType } from "@/client/agent";
import {
  DEFAULT_E2B_INTERPRETER_TOOL_CONFIG,
  E2BInterpreterToolConfigType,
} from "@/client/tools/interpreter";
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

export const E2BInterpreterConfig = ({
  form,
}: {
  form: UseFormReturn<AgentConfigType>;
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="tools.interpreter.enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                }}
              />
            </FormControl>
            <div>
              <FormLabel className="font-normal">Code Interpreter</FormLabel>
              <FormDescription>{DEFAULT_E2B_INTERPRETER_TOOL_CONFIG.description}</FormDescription>
            </div>
          </FormItem>
        )}
      />
      {form.watch("tools.interpreter.enabled") && (
        <div className="flex flex-col space-y-4 pl-6">
          <FormField
            control={form.control}
            name="tools.interpreter.config.api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key (*)</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    value={field.value ?? ""}
                    placeholder="API Key"
                  />
                </FormControl>
                <FormDescription>
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
