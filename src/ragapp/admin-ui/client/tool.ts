import { z } from "zod";
import {
  DEFAULT_DUCKDUCKGO_TOOL_CONFIG,
  DuckDuckGoToolConfig,
} from "./tools/duckduckgo";
import {
  DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG,
  ImageGeneratorToolConfig,
} from "./tools/image_generator";
import {
  DEFAULT_E2B_INTERPRETER_TOOL_CONFIG,
  E2BInterpreterToolConfig,
} from "./tools/interpreter";
import {
  DEFAULT_OPENAPI_TOOL_CONFIG,
  OpenAPIToolConfig,
} from "./tools/openapi";
import {
  DEFAULT_WIKIPEDIA_TOOL_CONFIG,
  WikipediaToolConfig,
} from "./tools/wikipedia";
import { getBaseURL } from "./utils";

export const ToolConfigSchema = z.object({
  duckduckgo: DuckDuckGoToolConfig,
  wikipedia: WikipediaToolConfig,
  openapi: OpenAPIToolConfig,
  interpreter: E2BInterpreterToolConfig,
  image_generator: ImageGeneratorToolConfig,
});
export type ToolConfigType = z.infer<typeof ToolConfigSchema>;

export const DEFAULT_TOOL_CONFIG = {
  duckduckgo: DEFAULT_DUCKDUCKGO_TOOL_CONFIG,
  wikipedia: DEFAULT_WIKIPEDIA_TOOL_CONFIG,
  openapi: DEFAULT_OPENAPI_TOOL_CONFIG,
  interpreter: DEFAULT_E2B_INTERPRETER_TOOL_CONFIG,
  image_generator: DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG,
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
