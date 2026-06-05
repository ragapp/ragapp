import { z } from "zod";
import { BaseConfigSchema } from "./base";

export const MiniMaxConfigSchema = BaseConfigSchema.extend({
  model_provider: z.literal("minimax"),
  minimax_api_key: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => value && value.trim() !== "",
      "MiniMax API Key is required",
    ),
});

export const DEFAULT_MINIMAX_CONFIG: z.input<typeof MiniMaxConfigSchema> = {
  model_provider: "minimax",
  model: "MiniMax-M3",
  embedding_model: "all-MiniLM-L6-v2",
  embedding_dim: 384,
  minimax_api_key: "",
};
