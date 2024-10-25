import { z } from "zod";

export const DocumentGeneratorToolConfig = z.object({
  name: z.literal("document_generator"),
  label: z.string(),
  description: z.string(),
  enabled: z.boolean().nullable().optional(),
  config: z.object({}).nullable().optional(),
  priority: z.number(),
});

export type DocumentGeneratorToolConfigType = z.infer<
  typeof DocumentGeneratorToolConfig
>;

export const DEFAULT_DOCUMENT_GENERATOR_TOOL_CONFIG: DocumentGeneratorToolConfigType =
  {
    name: "document_generator",
    label: "Document Generator",
    description: "Generate a document file (PDF, HTML)",
    config: {},
    enabled: false,
    priority: 2,
  };
