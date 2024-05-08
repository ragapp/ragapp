"use client";

import { getBaseURL } from "@/client/utils";

export const DemoChat = () => {
  return (
    <div className="h-full w-full">
      <iframe
        className="w-full h-full rounded"
        src={`${getBaseURL()}/chat.html`}
        scrolling="no"
      ></iframe>
    </div>
  );
};
