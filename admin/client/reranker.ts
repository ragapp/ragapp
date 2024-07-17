import { z } from "zod";
import { getBaseURL } from "./utils";

export const CohereRerankerConfigSchema = z.object({
  use_reranker: z.boolean().optional(),
  rerank_provider: z.string().trim().optional(),
  cohere_api_key: z.string().trim().optional(),
});

export type CohereRerankerConfigFormType = z.TypeOf<
  typeof CohereRerankerConfigSchema
>;

export async function getReRankerConfig(): Promise<CohereRerankerConfigFormType> {
  const res = await fetch(`${getBaseURL()}/api/management/reranker`);
  if (!res.ok) {
    throw new Error("Failed to fetch reranker configuration");
  }
  return res.json();
}

export async function updateReRankerConfig(data: CohereRerankerConfigFormType) {
  const res = await fetch(`${getBaseURL()}/api/management/reranker`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
}
