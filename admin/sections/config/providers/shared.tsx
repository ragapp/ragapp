import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

export const ModelForm = ({
  form,
  defaultValues,
  supportedModels,
}: {
  form: UseFormReturn;
  defaultValues: any;
  supportedModels: string[];
}) => {
  return (
    <FormField
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Model</FormLabel>
          <FormControl>
            <Select
              defaultValue={defaultValues.model ?? supportedModels[0]}
              onValueChange={field.onChange}
              {...field}
            >
              <SelectTrigger>
                <SelectValue placeholder={supportedModels[0]} />
              </SelectTrigger>
              <SelectContent>
                {supportedModels?.map((model: string) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>
            Select a model to chat with. If you are not sure, leave it as is.
          </FormDescription>
        </FormItem>
      )}
    />
  );
};
