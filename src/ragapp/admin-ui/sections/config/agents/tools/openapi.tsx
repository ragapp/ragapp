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
  return (
    <>
      <FormField
        control={form.control}
        name="tools.OpenAPI.enabled"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <div className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">OpenAPI</FormLabel>
            </div>
            <FormDescription className="text-xs">
              {DEFAULT_OPENAPI_TOOL_CONFIG.description}
            </FormDescription>
          </FormItem>
        )}
      />
      {form.watch("tools.OpenAPI.enabled") && (
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
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};
