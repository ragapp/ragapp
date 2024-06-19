import {
  FileLoaderSchema,
  fetchFileLoader,
  updateFileLoader,
} from "@/client/loader";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";

export const FileLoaderConfig = () => {
  const loaderForm = useForm({
    resolver: zodResolver(FileLoaderSchema),
  });
  const { data: fileLoader, refetch } = useQuery(
    "fileLoader",
    fetchFileLoader,
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (fileLoader) {
      loaderForm.reset(fileLoader);
    }
  }, [fileLoader, loaderForm]);

  const submitLoaderForm = async (data: any) => {
    try {
      await updateFileLoader(data);
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update file loader configuration!",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <h4 className="text-lg font-semibold mb-2">File loader configuration</h4>
      <Form {...loaderForm}>
        <form
          className="space-y-4 mb-4"
          onBlur={loaderForm.handleSubmit(submitLoaderForm)}
        >
          <FormField
            control={loaderForm.control}
            name="use_llama_parse"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      // Instantly update the form value
                      field.onChange(checked);
                      submitLoaderForm(loaderForm.getValues());
                    }}
                  />
                </FormControl>
                <div>
                  <FormLabel className="font-normal">Use Llama Parse</FormLabel>
                  <FormMessage />
                  <FormDescription>
                    Use Llama Parse to efficiency parse the pdf file
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          {loaderForm.watch("use_llama_parse") && (
            <FormField
              control={loaderForm.control}
              name="llama_cloud_api_key"
              render={({ field }) => (
                <FormItem className="ml-6">
                  <FormLabel>Llama Cloud API Key</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the API key for Llama Cloud to use Llama Parse
                  </FormDescription>
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    </>
  );
};
