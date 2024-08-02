import { z } from "zod";

export const OpenAPIToolConfig = z.object({
  name: z.literal("openapi"),
  label: z.string(),
  description: z.string(),
  enabled: z.boolean(),
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
export type OpenAPIToolConfigType = z.infer<typeof OpenAPIToolConfig>;
export const DEFAULT_OPENAPI_TOOL_CONFIG: OpenAPIToolConfigType = {
  name: "openapi",
  label: "OpenAPI",
  description: "OpenAPI tool description",
  enabled: false,
  config: {
    openapi_uri: "",
  },
};
