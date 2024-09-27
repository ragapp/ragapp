import { z } from "zod";
import { getBaseURL } from "./utils";

export const S3ConfigSchema = z.object({
  s3_path: z.string().trim().optional(),
  s3_path_meta_files: z.string().trim().optional(),
  s3_enabled: z.boolean().optional(),
  s3_bucket: z.string().trim().optional(),
  s3_url: z.string().trim().optional(),
});

export type S3ConfigFormType = z.TypeOf<typeof S3ConfigSchema>;

export async function getS3Config(): Promise<S3ConfigFormType> {
  const res = await fetch(`${getBaseURL()}/api/management/config/s3`);
  if (!res.ok) {
    throw new Error("Failed to fetch S3 configuration");
  }
  return res.json();
}

export async function updateS3Config(data: S3ConfigFormType) {
  const res = await fetch(`${getBaseURL()}/api/management/config/s3`, {
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
