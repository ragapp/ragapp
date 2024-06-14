import { JSONValue } from "ai";
import ChatInput from "./chat-input";
import ChatMessages from "./chat-messages";

export { type ChatHandler } from "./chat.interface";
export { ChatInput, ChatMessages };

export enum MessageAnnotationType {
  CSV = "csv",
  IMAGE = "image",
  SOURCES = "sources",
  EVENTS = "events",
  TOOLS = "tools",
}

export type ImageData = {
  url: string;
};

export type CsvFile = {
  content: string;
  filename: string;
  filesize: number;
  id: string;
};

export type CsvData = {
  csvFiles: CsvFile[];
};

export type SourceNode = {
  id: string;
  metadata: Record<string, unknown>;
  score?: number;
  text: string;
  url?: string;
};

export type SourceData = {
  nodes: SourceNode[];
};

export type EventData = {
  title: string;
  isCollapsed: boolean;
};

export type ToolData = {
  toolCall: {
    id: string;
    name: string;
    input: {
      [key: string]: JSONValue;
    };
  };
  toolOutput: {
    output: JSONValue;
    isError: boolean;
  };
};

export type AnnotationData =
  | ImageData
  | CsvData
  | SourceData
  | EventData
  | ToolData;

export type MessageAnnotation = {
  type: MessageAnnotationType;
  data: AnnotationData;
};

export function getAnnotationData<T extends AnnotationData>(
  annotations: MessageAnnotation[],
  type: MessageAnnotationType,
): T[] {
  return annotations.filter((a) => a.type === type).map((a) => a.data as T);
}
