"use client";

import { getBaseURL } from "@/client/utils";

export const DemoChat = () => {
  return (
    <div className="mt-8 w-full rounded-xl overflow-hidden">
      <iframe
        className="w-full h-full rounded"
        src={`${getBaseURL()}/chat.html`}
        scrolling="no"
      ></iframe>
    </div>
  );
};
