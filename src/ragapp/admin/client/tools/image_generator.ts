import { z } from "zod";

export const ImageGeneratorToolConfig = z.object({
  name: z.literal("image_generator"),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
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
export const DEFAULT_IMAGE_GENERATOR_TOOL_CONFIG = {
  label: "Image Generator",
  description:
    "Generate images from the provided text using the Stability AI API",
  config: {
    api_key: "",
  },
  enabled: false,
};
