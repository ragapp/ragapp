import { z } from "zod";

export const ImageGeneratorToolConfig = z.object({
  name: z.literal("img_gen"),
  label: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  description: z.string(),
  priority: z.number(),
  config: z
    .object({
      api_key: z
        .string()
        .nullable()
        .refine(
          (data) => {
            return data && data.length > 0;
          },
          { message: "API Key is required" },
        ),
    })
    .nullable()
    .optional(),
});

export type ImageGeneratorToolConfigType = z.infer<
  typeof ImageGeneratorToolConfig
>;

export const DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG: ImageGeneratorToolConfigType =
  {
    name: "img_gen",
    label: "Image Generator",
    description:
      "Generate images from the provided text using the Stability AI API",
    priority: 0,
    config: {
      api_key: "",
    },
    enabled: false,
  };
