/**
 * Resolve image URL for display. If the URL is relative (e.g. /uploads/...),
 * prepend the Medusa backend URL so images load when shop and backend are on different origins.
 */
const BACKEND_URL = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) || "http://localhost:9000";
const BASE = (BACKEND_URL || "").replace(/\/$/, "");

export function resolveImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const u = url.trim();
  if (u.startsWith("http") || u.startsWith("//")) return u;
  return `${BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}
