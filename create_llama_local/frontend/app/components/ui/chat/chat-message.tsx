import { Check, Copy } from "lucide-react";

import { Message } from "ai";
import { Fragment } from "react";
import { Button } from "../button";
import ChatAvatar from "./chat-avatar";
import { ChatEvents } from "./chat-events";
import { ChatImage } from "./chat-image";
import { ChatSources } from "./chat-sources";
import ChatTools from "./chat-tools";
import {
  AnnotationData,
  EventData,
  ImageData,
  MessageAnnotation,
  MessageAnnotationType,
  SourceData,
  ToolData,
} from "./index";
import Markdown from "./markdown";
import { useCopyToClipboard } from "./use-copy-to-clipboard";

type ContentDisplayConfig = {
  order: number;
  component: JSX.Element | null;
};

function getAnnotationData<T extends AnnotationData>(
  annotations: MessageAnnotation[],
  type: MessageAnnotationType,
): T[] {
  return annotations.filter((a) => a.type === type).map((a) => a.data as T);
}

function ChatMessageContent({
  message,
  isLoading,
}: {
  message: Message;
  isLoading: boolean;
}) {
  const annotations = message.annotations as MessageAnnotation[] | undefined;
  if (!annotations?.length) return <Markdown content={message.content} />;

  const imageData = getAnnotationData<ImageData>(
    annotations,
    MessageAnnotationType.IMAGE,
  );
  const eventData = getAnnotationData<EventData>(
    annotations,
    MessageAnnotationType.EVENTS,
  );
  const sourceData = getAnnotationData<SourceData>(
    annotations,
    MessageAnnotationType.SOURCES,
  );
  const toolData = getAnnotationData<ToolData>(
    annotations,
    MessageAnnotationType.TOOLS,
  );

  const contents: ContentDisplayConfig[] = [
    {
      order: -3,
      component: imageData[0] ? <ChatImage data={imageData[0]} /> : null,
    },
    {
      order: -2,
      component:
        eventData.length > 0 ? (
          <ChatEvents isLoading={isLoading} data={eventData} />
        ) : null,
    },
    {
      order: -1,
      component: toolData[0] ? <ChatTools data={toolData[0]} /> : null,
    },
    {
      order: 0,
      component: <Markdown content={message.content} />,
    },
    {
      order: 1,
      component: sourceData[0] ? <ChatSources data={sourceData[0]} /> : null,
    },
  ];

  return (
    <div className="flex-1 gap-4 flex flex-col">
      {contents
        .sort((a, b) => a.order - b.order)
        .map((content, index) => (
          <Fragment key={index}>{content.component}</Fragment>
        ))}
    </div>
  );
}

export default function ChatMessage({
  chatMessage,
  isLoading,
}: {
  chatMessage: Message;
  isLoading: boolean;
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  return (
    <div className="flex items-start gap-4 pr-5 pt-5">
      <ChatAvatar role={chatMessage.role} />
      <div className="group flex flex-1 justify-between gap-2">
        <ChatMessageContent message={chatMessage} isLoading={isLoading} />
        <Button
          onClick={() => copyToClipboard(chatMessage.content)}
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
