import { AgentConfigType } from "@/client/agent";
import { DEFAULT_OPENAPI_TOOL_CONFIG } from "@/client/tools/openapi";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

export const OpenAPIConfig = ({
  form,
}: {
  form: UseFormReturn<AgentConfigType>;
}) => {
  const toolConfig = form.watch("tools.OpenAPI") || DEFAULT_OPENAPI_TOOL_CONFIG;

  return (
    <>
      <FormField
        control={form.control}
        name="tools.OpenAPI.enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="leading-none">
              <FormLabel className="text-sm font-medium">OpenAPI</FormLabel>
              <FormDescription className="text-xs">
                {DEFAULT_OPENAPI_TOOL_CONFIG.description}
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      {form.watch("tools.OpenAPI.enabled") && (
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
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </>
  );
};
