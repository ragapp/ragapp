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

const DEFAULT_TITLE = "Model";
const DEFAULT_DESCRIPTION =
  "Select a model to chat with. If you are not sure, leave it as is.";
const DEFAULT_MODEL_FIELD_NAME = "model";

export const ModelForm = ({
  form,
  title,
  description,
  model_field_name,
  defaultValues,
  supportedModels,
}: {
  form: UseFormReturn;
  title?: string;
  description?: string;
  model_field_name?: string;
  defaultValues: any;
  supportedModels: string[];
}) => {
  return (
    <FormField
      control={form.control}
      name={model_field_name ?? DEFAULT_MODEL_FIELD_NAME}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{title ?? DEFAULT_TITLE}</FormLabel>
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
            {description ?? DEFAULT_DESCRIPTION}
          </FormDescription>
        </FormItem>
      )}
    />
  );
};
