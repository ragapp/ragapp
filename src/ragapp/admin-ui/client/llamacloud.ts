import { z } from "zod";
import { getBaseURL } from "./utils";

export const LlamaCloudConfigSchema = z.object({
  llama_cloud_index_name: z.string().trim().min(1),
  llama_cloud_project_name: z.string().trim().min(1),
  llama_cloud_api_key: z.string().trim().min(1),
});

export type LlamaCloudConfigFormType = z.TypeOf<typeof LlamaCloudConfigSchema>;

export type LlamaCloudConfig = {
  use_llama_cloud: boolean;
  llama_cloud_index_name: string;
  llama_cloud_project_name: string;
  llama_cloud_api_key: string;
};

export async function getLlamaCloudConfig(): Promise<LlamaCloudConfig> {
  const res = await fetch(`${getBaseURL()}/api/management/llamacloud`);
  if (!res.ok) {
    throw new Error("Failed to fetch llamacloud configuration");
  }
  return res.json();
}

export async function updateLlamaCloudConfig(
  data: Partial<Omit<LlamaCloudConfig, "llamacloud_dashboard_url">>,
) {
  const res = await fetch(`${getBaseURL()}/api/management/llamacloud`, {
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
