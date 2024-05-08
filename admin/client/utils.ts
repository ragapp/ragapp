export function getBaseURL(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}
