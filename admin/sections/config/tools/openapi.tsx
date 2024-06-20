import { ToolConfigType } from "@/client/tool";
import {
  DEFAULT_OPENAPI_TOOL_CONFIG,
  OpenAPIToolConfigType,
} from "@/client/tools/openapi";
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

// Todo: Use a separated form for OpenAPIConfig
export const OpenAPIConfig = ({
  form,
  onSubmit,
}: {
  form: UseFormReturn<ToolConfigType>;
  onSubmit: (tool_name: string, data: OpenAPIToolConfigType) => void;
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="openapi"
        render={({ field }) => (
          <FormItem
            key={field.value.name}
            className="flex flex-row items-center space-x-3 space-y-0"
          >
            <FormControl>
              <Checkbox
                checked={field.value.enabled ?? false}
                onCheckedChange={(checked) => {
                  // Submit the openapi config when the checkbox has changed and either:
                  // 1. The checkbox is unchecked
                  // 2. Or the checkbox is checked and the openapi_uri is valid
                  field.onChange({
                    ...field.value,
                    enabled: checked,
                  });
                  const openAPIConfig = form.getValues().openapi;
                  if (
                    (checked &&
                      openAPIConfig &&
                      openAPIConfig?.config?.openapi_uri) ||
                    !checked
                  ) {
                    onSubmit(
                      field.value.name,
                      openAPIConfig ?? DEFAULT_OPENAPI_TOOL_CONFIG,
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
      {form.getValues().openapi?.enabled && (
        <div className="flex flex-col space-y-4 pl-6">
          <FormField
            control={form.control}
            name="openapi.config.openapi_uri"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={field.value ? "text-gray-700" : "text-red-500"}
                >
                  URL to OpenAPI spec (*)
                </FormLabel>
                <FormControl
                  onBlur={() => {
                    // Validate the openapi_uri when the input is blurred
                    // and submit the openapi config if the openapi_uri is valid
                    form.trigger("openapi.config").then((value: boolean) => {
                      const openAPIConfig = form.getValues().openapi;
                      if (value && openAPIConfig) {
                        onSubmit("openapi", openAPIConfig);
                      }
                    });
                  }}
                >
                  <Input
                    {...field}
                    placeholder="https://example.com/openapi.yaml"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  The URL to the OpenAPI specification file (YAML or JSON).
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};
