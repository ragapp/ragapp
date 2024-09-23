import { z } from "zod";

export type Service = {
  id: string;
  name: string;
  app_name: string | null;
  started_at: string;
  created_at: string;
  updated_at: string | null;
  status: string;
  image: string;
  restart_count: number;
  url: string;
};

export const ragappFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .refine((value) => /^[a-zA-Z0-9-_]+$/.test(value), {
        message:
          "Name can only contain alphanumeric characters, dashes, or underscores",
      }),
    connectToExternalData: z.boolean(),
    s3BucketName: z.string().optional(),
    s3AccessKey: z.string().optional(),
    s3SecretKey: z.string().optional(),
    s3Url: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.connectToExternalData) {
      if (!data.s3BucketName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "S3 Bucket Name is required",
          path: ["s3BucketName"],
        });
      }
      if (!data.s3AccessKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "S3 Access Key is required",
          path: ["s3AccessKey"],
        });
      }
      if (!data.s3SecretKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "S3 Secret Key is required",
          path: ["s3SecretKey"],
        });
      }
      if (!data.s3Url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "S3 URL is required",
          path: ["s3Url"],
        });
      }
    }
  });

export const defaultRAGAppFormValues = ragappFormSchema.parse({
  name: "my-app",
  connectToExternalData: false,
});

export type RAGAppFormType = z.infer<typeof ragappFormSchema>;
