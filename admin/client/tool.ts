import { z } from "zod";
import { getBaseURL } from "./utils";

const DuckDuckGoToolConfig = z.object({
  name: z.literal("duckduckgo"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
});

const WikipediaToolConfig = z.object({
  name: z.literal("wikipedia"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
});

const OpenAPIToolConfig = z.object({
  name: z.literal("openapi"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  config: z
    .object({
      openapi_uri: z
        .string()
        .nullable()
        .refine(
          (data) => {
            if (data) {
              try {
                new URL(data);
                return true;
              } catch (error) {
                return false;
              }
            }
          },
          {
            message: "OpenAPI URL is not valid",
          },
        ),
    })
    .nullable()
    .optional(),
});

export const ToolConfigSchema = z.object({
  duckduckgo: DuckDuckGoToolConfig.optional(),
  wikipedia: WikipediaToolConfig.optional(),
  openapi: OpenAPIToolConfig.optional(),
});

export const DEFAULT_TOOL_CONFIG = {
  duckduckgo: {
    name: "duckduckgo",
    label: "DuckDuckGo",
    description: "",
    config: {},
    enabled: false,
  },
  wikipedia: {
    name: "wikipedia",
    label: "Wikipedia",
    description: "",
    config: {},
    enabled: false,
  },
  openapi: {
    name: "openapi",
    label: "OpenAPI Actions",
    description: "",
    config: {
      openapi_uri: "",
    },
    enabled: false,
  },
};

export async function updateToolConfig(tool_name: string, data: any) {
  const res = await fetch(`${getBaseURL()}/api/management/tools/${tool_name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return (await res.json()).data;
}

export async function getToolsConfig() {
  const res = await fetch(`${getBaseURL()}/api/management/tools`);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return await res.json();
}
