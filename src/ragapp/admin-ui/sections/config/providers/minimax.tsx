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
import { ModelForm } from "./shared";

export const MiniMaxForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const supportingModels = [
    "MiniMax-M3",
    "MiniMax-M2.7",
    "MiniMax-M2.7-highspeed",
  ];

  return (
    <>
      <FormField
        control={form.control}
        name="minimax_api_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>MiniMax API Key (*)</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={defaultValues.minimax_api_key ?? "eyJ..."}
                showCopy
                {...field}
              />
            </FormControl>
            <FormDescription>
              Get your API key from{" "}
              <a href="https://platform.minimaxi.com/user-center/basic-information/interface-key" target="_blank">
                https://platform.minimaxi.com
              </a>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <ModelForm
        form={form}
        defaultValue={defaultValues.model}
        supportedModels={supportingModels}
      />
    </>
  );
};
