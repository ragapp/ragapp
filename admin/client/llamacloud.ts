import { getBaseURL } from "./utils";

export type LlamaCloudConfig = {
  use_llama_cloud: boolean;
  llamacloud_index_name: string;
  llamacloud_project_name: string;
  llamacloud_api_key: string;
  llamacloud_dashboard_url: string;
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
