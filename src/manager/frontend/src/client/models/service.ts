import { z } from "zod"

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
}

export const ragappFormSchema = z.object({
    name: z.string().trim().min(1),
    image: z.string().trim().min(1),
});

export const defaultRAGAppFormValues = ragappFormSchema.parse({
    name: "my-app",
    image: "ragapp/ragapp:latest",
});

export type RAGAppFormType = z.infer<typeof ragappFormSchema>;