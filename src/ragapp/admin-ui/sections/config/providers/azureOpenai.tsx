import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

export const AzureOpenAIForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const MODELS = ["gpt-35-turbo", "gpt-4o", "gpt-4"];
  const EMBEDDING_MODELS = [
    "text-embedding-3-small",
    "text-embedding-3-medium",
    "text-embedding-3-large",
    "text-embedding-ada-002",
  ];

  return (
    <>
      <div className="flex flex-row w-full space-x-2 pt-4">
        <FormField
          control={form.control}
          name="azure_openai_endpoint"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>API Endpoint</FormLabel>
              <FormDescription>
                Please check how to get the endpoint in
                <a
                  className="italic"
                  href="https://learn.microsoft.com/en-us/azure/ai-services/openai/reference"
                  target="_blank"
                  rel="noreferrer"
                >
                  {" "}
                  this documentation
                </a>
              </FormDescription>
              <FormControl>
                <Input
                  type="text"
                  placeholder="https://{your-custom-endpoint}.openai.azure.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="azure_openai_api_version"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>API Version</FormLabel>
              <FormDescription>
                Please check the API version in
                <a
                  className="italic"
                  href="https://learn.microsoft.com/en-us/azure/ai-services/openai/api-version-deprecation#latest-preview-api-releases"
                  target="_blank"
                  rel="noreferrer"
                >
                  {" "}
                  this documentation
                </a>
              </FormDescription>
              <FormControl>
                <Input
                  type="text"
                  placeholder={defaultValues.azure_openai_api_version}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="azure_openai_api_key"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>API Key</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={
                  defaultValues.azure_openai_api && "****************"
                }
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex flex-row w-full space-x-2">
        <FormField
          control={form.control}
          name="azure_openai_llm_deployment"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>LLM deployment</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={
                    defaultValues.azure_openai_llm_deployment ?? "gpt-4-turbo"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>LLM Model</FormLabel>
              <FormControl>
                <Select
                  defaultValue={defaultValues.model ?? "gpt-35-turbo"}
                  onValueChange={field.onChange}
                  {...field}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="gpt-35-turbo" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex flex-row w-full space-x-2">
        <FormField
          control={form.control}
          name="azure_openai_embedding_deployment"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>Embedding deployment</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={
                    defaultValues.azure_openai_embedding_deployment ??
                    "text-embedding-3-small"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="embedding_model"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>Embedding Model</FormLabel>
              <FormControl>
                <Select
                  defaultValue={
                    defaultValues.embedding_model ?? "text-embedding-3-small"
                  }
                  onValueChange={field.onChange}
                  {...field}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="text-embedding-3-small" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMBEDDING_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
