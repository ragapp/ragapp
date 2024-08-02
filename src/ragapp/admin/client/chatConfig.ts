import { z } from "zod";
import { getBaseURL } from "./utils";

// Chat config scheme
export const ChatConfigSchema = z.object({
  custom_prompt: z.string().optional(),
  conversation_starters: z.array(z.string()),
});

export type ChatConfigFormType = z.TypeOf<typeof ChatConfigSchema>;

export async function getChatConfig(): Promise<ChatConfigFormType> {
  const res = await fetch(`${getBaseURL()}/api/management/config/chat`);
  if (!res.ok) {
    throw new Error("Failed to fetch chat config");
  }
  return res.json();
}

export async function updateChatConfig(
  data: ChatConfigFormType,
): Promise<ChatConfigFormType> {
  const res = await fetch(`${getBaseURL()}/api/management/config/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update chat config");
  }
  return res.json();
}
