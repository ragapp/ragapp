import { z } from "zod";
import { getBaseURL } from "./utils";

export const ConfigFormSchema = z.object({
  openai_api_key: z
    .string({
      required_error: "OpenAI API is required",
    })
    .nullable()
    .optional(),
  model: z.string().nullable().optional(),
  system_prompt: z.string().nullable().optional(),
  configured: z.boolean().nullable().optional(),
});

export type ConfigFormType = z.TypeOf<typeof ConfigFormSchema>;

export const DEFAULT_CONFIG: z.input<typeof ConfigFormSchema> = {};

export async function fetchConfig(): Promise<ConfigFormType> {
  const res = await fetch(`${getBaseURL()}/api/management/config`);
  if (!res.ok) {
    const error = await res.text();
    console.error(error);
    return DEFAULT_CONFIG;
  }
  const data = await res.json();
  return data;
}

export async function updateConfig(
  data: ConfigFormType,
): Promise<ConfigFormType> {
  // Ignore configured attribute
  const { configured, ...updateValues } = data;

  const res = await fetch(`${getBaseURL()}/api/management/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateValues),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return (await res.json()).data as ConfigFormType;
}
