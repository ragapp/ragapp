import { ToolConfigType } from "@/client/tool";
import {
  DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG,
  ImageGeneratorToolConfigType,
} from "@/client/tools/image_generator";
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

export const ImageGeneratorConfig = ({
  form,
  onSubmit,
}: {
  form: UseFormReturn<ToolConfigType>;
  onSubmit: (tool_name: string, data: ImageGeneratorToolConfigType) => void;
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="image_generator"
        render={({ field }) => (
          <FormItem
            key={field.value.name}
            className="flex flex-row items-center space-x-3 space-y-0"
          >
            <FormControl>
              <Checkbox
                checked={field.value.enabled ?? false}
                onCheckedChange={(checked) => {
                  field.onChange({
                    ...field.value,
                    enabled: checked,
                  });
                  const imgGeneratorConfig = form.getValues().image_generator;
                  if (
                    (checked &&
                      imgGeneratorConfig &&
                      imgGeneratorConfig?.config?.api_key) ||
                    !checked
                  ) {
                    onSubmit(
                      field.value.name,
                      imgGeneratorConfig ?? DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG,
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
      {form.watch("image_generator.enabled") && (
        <div className="flex flex-col space-y-4 pl-6">
          <FormField
            control={form.control}
            name="image_generator.config.api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={field.value ? "text-gray-700" : "text-red-500"}
                >
                  API Key (*)
                </FormLabel>
                <FormControl
                  onBlur={() => {
                    const imgGeneratorConfig = form.getValues().image_generator;
                    if (
                      imgGeneratorConfig &&
                      imgGeneratorConfig?.config?.api_key &&
                      imgGeneratorConfig?.enabled
                    ) {
                      onSubmit(
                        "image_generator",
                        imgGeneratorConfig ??
                          DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG,
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
                  Get the Stability AI API Key from{" "}
                  <a
                    href="https://platform.stability.ai/account/keys"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://platform.stability.ai/account/keys
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
