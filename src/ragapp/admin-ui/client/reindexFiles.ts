import { getBaseURL } from "./utils";

export async function reIndexAllFiles() {
  const res = await fetch(`${getBaseURL()}/api/management/files/reindex`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
}
