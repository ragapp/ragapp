"use client";

import { useChat } from "ai/react";
import { ChatInput, ChatMessages } from "./ui/chat";

type ChatUILayout = "default" | "fit";

export default function ChatSection({ layout }: { layout?: ChatUILayout }) {
  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
  } = useChat({
    api: process.env.NEXT_PUBLIC_CHAT_API,
    headers: {
      "Content-Type": "application/json", // using JSON because of vercel/ai 2.2.26
    },
    onError: (error) => {
      const message = JSON.parse(error.message);
      alert(message.detail);
    },
  });

  return (
    <div
      className={`flex flex-col space-y-4 justify-between w-full pb-4 ${layout === "fit" ? "h-full p-2" : "max-w-5xl h-[50vh]"}`}
    >
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        reload={reload}
        stop={stop}
      />
      <ChatInput
        input={input}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        multiModal={true}
      />
    </div>
  );
}
