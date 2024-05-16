import { UseFormReturn } from "react-hook-form";
import { ModelForm } from "./shared";

export const OllamaForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const defaultModels = ["llama3:8b", "phi3"];
  return (
    <>
      <ModelForm
        form={form}
        defaultValues={defaultValues}
        supportedModels={defaultModels}
      />
    </>
  );
};
