import { S3ConfigSchema, getS3Config, updateS3Config } from "@/client/s3Config";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";

export const S3Config = () => {
  const form = useForm({
    resolver: zodResolver(S3ConfigSchema),
  });

  const { data: config, refetch } = useQuery("s3Config", getS3Config, {
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (config) {
      form.reset(config);
    }
  }, [form, config]);

  const submitS3ConfigForm = async (data: any) => {
    try {
      await updateS3Config(data);
      refetch();
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to update reranker configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="space-y-4 mb-4"
          onBlur={form.handleSubmit(submitS3ConfigForm)}
        >
          {process.env.S3?.toLowerCase() !== "true" && (
            <>
              <FormField
                control={form.control}
                name="s3_path"
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormLabel>S3 Path</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the path to the S3 bucket where the documents are
                      stored. You can enter multiple paths separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="ml-6">
                <FormDescription>
                  Connected to S3 bucket: {process.env.S3_BUCKET_NAME} at{" "}
                  {process.env.S3_URL}
                </FormDescription>
              </div>
            </>
          )}
        </form>
      </Form>
    </>
  );
};
