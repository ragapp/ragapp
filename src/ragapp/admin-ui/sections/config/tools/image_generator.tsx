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
import { UseFormReturn } from "react-hook-form";

export const ImageGeneratorConfig = ({
  form,
  // onSubmit,
}: {
  form: UseFormReturn<AgentConfigType>;
  // onSubmit: (data: AgentConfigType) => void;
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="tools.ImageGenerator.enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                }}
              />
            </FormControl>
            <div>
              <FormLabel className="font-normal">Image Generator</FormLabel>
              <FormDescription>
                {DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG.description}
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      {form.watch("tools.ImageGenerator.enabled") && (
        <div className="flex flex-col space-y-4 pl-6">
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
