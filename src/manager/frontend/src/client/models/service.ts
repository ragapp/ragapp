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

export const ragappFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .refine((value) => /^[a-zA-Z0-9-_]+$/.test(value), {
      message:
        "Name can only contain alphanumeric characters, dashes, or underscores",
    }),
});

export const defaultRAGAppFormValues = ragappFormSchema.parse({
  name: "my-app",
});

export type RAGAppFormType = z.infer<typeof ragappFormSchema>;
