"use client";

import { getBaseURL } from "@/client/utils";

export const DemoChat = () => {
  return (
    <div className="h-full w-full">
      <iframe
        className="w-full h-full rounded"
        src={`${getBaseURL()}/chat.html`}
        scrolling="no"
        id="demo-chat-iframe"
      ></iframe>
    </div>
  );
};

export const reloadDemoChat = () => {
  const iframe = document.getElementById(
    "demo-chat-iframe",
  ) as HTMLIFrameElement;
  if (iframe) {
    iframe.src = iframe.src;
  }
};
