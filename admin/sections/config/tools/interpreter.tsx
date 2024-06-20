import { ToolConfigType } from "@/client/tool";
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
  onSubmit,
}: {
  form: UseFormReturn<ToolConfigType>;
  onSubmit: (tool_name: string, data: E2BInterpreterToolConfigType) => void;
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="interpreter"
        render={({ field }) => (
          <FormItem
            key={field.value.name}
            className="flex flex-row items-center space-x-3 space-y-0"
          >
            <FormControl>
              <Checkbox
                checked={field.value.enabled ?? false}
                onCheckedChange={(checked) => {
                  // Submit the interpreter config when the checkbox has changed and either:
                  // 1. The checkbox is unchecked
                  // 2. Or the checkbox is checked and the api_key is valid
                  field.onChange({
                    ...field.value,
                    enabled: checked,
                  });
                  const interpreterConfig = form.getValues().interpreter;
                  if (
                    (checked &&
                      interpreterConfig &&
                      interpreterConfig?.config?.api_key) ||
                    !checked
                  ) {
                    onSubmit(
                      field.value.name,
                      interpreterConfig ?? DEFAULT_E2B_INTERPRETER_TOOL_CONFIG,
                    );
                  }
                }}
              />
            </FormControl>
            <div>
              <FormLabel className="font-normal">{field.value.label}</FormLabel>
              <FormDescription>{field.value.description}</FormDescription>
            </div>
          </FormItem>
        )}
      />
      {form.watch("interpreter.enabled") && (
        <div className="flex flex-col space-y-4 pl-6">
          <FormField
            control={form.control}
            name="interpreter.config.api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={field.value ? "text-gray-700" : "text-red-500"}
                >
                  API Key (*)
                </FormLabel>
                <FormControl
                  onBlur={() => {
                    const interpreterConfig = form.getValues().interpreter;
                    if (
                      interpreterConfig &&
                      interpreterConfig?.config?.api_key &&
                      interpreterConfig?.enabled
                    ) {
                      onSubmit(
                        "interpreter",
                        interpreterConfig ??
                          DEFAULT_E2B_INTERPRETER_TOOL_CONFIG,
                      );
                    }
                  }}
                >
                  <PasswordInput
                    {...field}
                    placeholder="API Key"
                    value={field.value ?? ""}
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
