// Patching to use value from window.ENV.BASE_URL  
"use client";

import { useEffect, useMemo, useState } from "react";

export interface ChatConfig {
  backend?: string;
  starterQuestions?: string[];
}

export function useClientConfig(): ChatConfig {
  const chatAPI = process.env.NEXT_PUBLIC_CHAT_API;
  const [config, setConfig] = useState<ChatConfig>();

  const backendOrigin = useMemo(() => {
    if (chatAPI) {
      return chatAPI || "";
    } else {
      if (typeof window !== "undefined") {
        // Use BASE_URL from window.ENV
        return (window as any).ENV?.BASE_URL || "";
      }
      return "";
    }
  }, [chatAPI]);

  const configAPI = `${backendOrigin}/api/chat/config`;

  useEffect(() => {
    fetch(configAPI)
      .then((response) => response.json())
      .then((data) => setConfig({ ...data, chatAPI }))
      .catch((error) => console.error("Error fetching config", error));
  }, [chatAPI, configAPI]);

  return {
    backend: backendOrigin,
    starterQuestions: config?.starterQuestions,
  };
}
