"use client";

import { getBaseURL } from "@/client/utils";
import { RefreshCw } from "lucide-react";
import { forwardRef, useRef } from "react";

const DemoChat = forwardRef((props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="h-full w-full">
      <iframe
        ref={iframeRef}
        className="w-full h-full rounded"
        src={`${getBaseURL()}/chat.html`}
        scrolling="no"
      ></iframe>
      <button
        className="absolute bg-white text-gray-500 rounded-full p-4 top-20 right-8"
        onClick={() => {
          const iframe = iframeRef.current;
          if (iframe) {
            iframe.src += "";
          }
        }}
      >
        <RefreshCw className="w-8" strokeWidth={3} />
      </button>
    </div>
  );
});

DemoChat.displayName = "DemoChat";

export { DemoChat };
