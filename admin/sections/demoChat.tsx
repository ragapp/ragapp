"use client";

import { getBaseURL } from "@/client/utils";
import { forwardRef, useImperativeHandle, useRef } from "react";

const DemoChat = forwardRef((props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    getIframe: () => {
      return iframeRef.current;
    },
    reloadIframe: () => {
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.src += "";
      }
    },
  }));

  return (
    <div className="h-full w-full">
      <iframe
        ref={iframeRef}
        className="w-full h-full rounded"
        src={`${getBaseURL()}/chat.html`}
        scrolling="no"
      ></iframe>
    </div>
  );
});

DemoChat.displayName = "DemoChat";

export { DemoChat };
