/**
 * Backend PDF endpoints (admin-hub, no auth in dev — keep order UUIDs unguessable).
 */
export function getOrderPdfDownloadUrl(orderId, kind) {
  const raw =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) || "";
  const base = String(raw).trim().replace(/\/$/, "");
  if (!base || !orderId) return "#";
  const path = kind === "lieferschein" ? "lieferschein" : "invoice";
  return `${base}/admin-hub/v1/orders/${encodeURIComponent(orderId)}/pdf/${path}`;
}
