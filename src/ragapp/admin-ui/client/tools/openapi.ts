import { z } from "zod";

export const OpenAPIToolConfig = z.object({
  name: z.literal("openapi"),
  label: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  description: z.string(),
  priority: z.number(),
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
            return false;
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
  description:
    "Make requests to external APIs using the information from the OpenAPI spec",
  enabled: false,
  config: {
    openapi_uri: null,
  },
  priority: 10,
};
