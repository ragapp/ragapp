import { z } from "zod";
import { getBaseURL } from "./utils";

export type LoaderType = "file";

export const FileLoaderSchema = z.object({
  loader_name: z.literal("file"),
  use_llama_parse: z.boolean().default(false),
  llama_cloud_api_key: z.string().nullable().optional(),
});

export type FileLoader = z.infer<typeof FileLoaderSchema>;

export async function fetchFileLoader(): Promise<FileLoader> {
  const res = await fetch(
    `${getBaseURL()}/api/management/loader?loader_name=file`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch file loader config");
  }
  return res.json();
}

export async function updateFileLoader(loader_config: FileLoader) {
  const res = await fetch(`${getBaseURL()}/api/management/loader`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loader_config),
  });
  if (!res.ok) {
    throw new Error("Failed to update file loader");
  }
}
