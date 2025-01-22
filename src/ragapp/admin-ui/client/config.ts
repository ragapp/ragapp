import { getBaseURL } from "./utils";

export async function fetchIsAppConfigured(): Promise<boolean> {
  const response = await fetch(`${getBaseURL()}/api/management/config/is_configured`);
  return response.json();
}
