export function getBaseURL(): string {
  // If we are in development, use the local backend server
  if (process.env.ENVIRONMENT === "dev") {
    return "http://localhost:8000";
  }
  // Otherwise, in production, we can either:
  // - Or use the BASE_URL environment variable if it is set (suitable for reverse proxy deployment)
  if (typeof window !== "undefined") {
    const w = window as any;
    if (w.ENV && typeof w.ENV.BASE_URL === "string") {
      return w.ENV.BASE_URL;
    }
  }
  return "";
}
