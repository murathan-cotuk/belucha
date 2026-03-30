"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtCents(c) {
  if (c == null) return "—";
  return (Number(c) / 100).toFixed(2).replace(".", ",") + " €";
}

const ORDER_STATUS_LABEL = {
  pending: "Ausstehend", processing: "In Bearbeitung", shipped: "Versendet",
  delivered: "Geliefert", cancelled: "Storniert", refunded: "Erstattet",
  completed: "Abgeschlossen",
};

function groupByOrder(messages) {
  const map = {};
  for (const m of messages) {
    const key = m.order_id || "__no_order__";
    if (!map[key]) {
      map[key] = {
        order_id: m.order_id,
        order_number: m.order_number,
        order_status: m.order_status || m.order_order_status,
        order_total_cents: m.order_total_cents,
        order_first_name: m.order_first_name,
        order_last_name: m.order_last_name,
        order_email: m.order_email,
        messages: [],
      };
    }
    map[key].messages.push(m);
  }
  // Sort threads by latest message (descending) and messages within thread ascending
  return Object.values(map)
    .map((t) => ({ ...t, messages: [...t.messages].sort((a, b) => (a.created_at || "").localeCompare(b.created_at || "")) }))
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.created_at || "";
      const bLast = b.messages[b.messages.length - 1]?.created_at || "";
      return bLast.localeCompare(aLast);
    });
}

export default function InboxPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const bottomRef = useRef(null);
  const client = getMedusaAdminClient();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.getMessages();
      if (!data?.__error) setThreads(groupByOrder(data?.messages || []));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Scroll to bottom whenever thread changes or new message arrives
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [selected?.messages?.length]);

  const handleSelectThread = async (thread) => {
    setSelected(thread);
    setReply("");
    setErr("");
    setOrderItems([]);
    // Fetch order items if there's an order
    if (thread.order_id) {
      try {
        const data = await client.request(`/admin-hub/orders/${thread.order_id}`);
        if (data?.order?.items) setOrderItems(data.order.items);
      } catch (_) {}
    }
    // Mark unread as read
    for (const m of thread.messages) {
      if (m.sender_type === "customer" && !m.is_read_by_seller) {
        client.markMessageRead(m.id).catch(() => {});
      }
    }
  };

  const handleSend = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    setErr("");
    try {
      await client.sendMessage({
        order_id: selected.order_id || undefined,
        body: reply.trim(),
        subject: selected.order_number ? `Re: Bestellung #${selected.order_number}` : "Nachricht",
      });
      setReply("");
      const data = await client.getMessages();
      if (!data?.__error) {
        const updatedThreads = groupByOrder(data?.messages || []);
        setThreads(updatedThreads);
        const key = selected.order_id || "__no_order__";
        const updatedThread = updatedThreads.find((t) => (t.order_id || "__no_order__") === key);
        if (updatedThread) setSelected(updatedThread);
      }
    } catch (e) {
      setErr(e?.message || "Fehler");
    }
    setSending(false);
  };

  const unreadCount = (thread) =>
    thread.messages.filter((m) => m.sender_type === "customer" && !m.is_read_by_seller).length;

  const statusLabel = (s) => ORDER_STATUS_LABEL[s] || s || "—";

  return (
    <div style={{ padding: "24px 20px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 20px" }}>Nachrichten</h1>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 280px", gap: 12, height: "calc(100vh - 160px)", minHeight: 400 }}>

        {/* ── Thread list ── */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #f3f4f6" }}>
            Konversationen
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && <div style={{ padding: 20, color: "#9ca3af", fontSize: 13, textAlign: "center" }}>Laden…</div>}
            {!loading && threads.length === 0 && (
              <div style={{ padding: 24, color: "#9ca3af", fontSize: 13, textAlign: "center" }}>Keine Nachrichten</div>
            )}
            {threads.map((thread) => {
              const last = thread.messages[thread.messages.length - 1];
              const unread = unreadCount(thread);
              const isActive = selected && (selected.order_id || "__no_order__") === (thread.order_id || "__no_order__");
              const customerName = [thread.order_first_name, thread.order_last_name].filter(Boolean).join(" ") || thread.order_email || "Kunde";
              return (
                <button
                  key={thread.order_id || "__no_order__"}
                  onClick={() => handleSelectThread(thread)}
                  style={{
                    width: "100%", textAlign: "left", padding: "11px 14px",
                    background: isActive ? "#fff7ed" : "#fff",
                    borderLeft: isActive ? "3px solid #ff971c" : "3px solid transparent",
                    borderRight: "none", borderTop: "none", borderBottom: "1px solid #f3f4f6", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {thread.order_number ? `#${thread.order_number}` : "Allgemein"}
                    </span>
                    {unread > 0 && (
                      <span style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", fontSize: 10, fontWeight: 800, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{unread}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{customerName}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {last?.body?.slice(0, 50) || "—"}
                  </div>
                  <div style={{ fontSize: 10, color: "#b4b4b4", marginTop: 2 }}>{fmtDate(last?.created_at)}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Message thread ── */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
              Konversation auswählen
            </div>
          ) : (
            <>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                  {selected.order_number ? `Bestellung #${selected.order_number}` : "Allgemein"}
                </span>
                {selected.order_id && (
                  <a href={`/orders/${selected.order_id}`} style={{ fontSize: 11, color: "#ff971c", textDecoration: "none", fontWeight: 600 }}>
                    Öffnen →
                  </a>
                )}
                {selected.order_status && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#f3f4f6", color: "#374151" }}>
                    {statusLabel(selected.order_status)}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {selected.messages.map((m) => {
                  const isSeller = m.sender_type === "seller";
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: isSeller ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "72%",
                        background: isSeller ? "#ff971c" : "#f3f4f6",
                        color: isSeller ? "#fff" : "#111827",
                        borderRadius: isSeller ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        padding: "9px 13px", fontSize: 13,
                      }}>
                        <div style={{ lineHeight: 1.5 }}>{m.body}</div>
                        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65 }}>{fmtDate(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: "10px 16px", borderTop: "1px solid #f3f4f6" }}>
                {err && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 6 }}>{err}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Antwort schreiben… (Enter zum Senden)"
                    rows={2}
                    style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, resize: "none", outline: "none" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !reply.trim()}
                    style={{ padding: "0 16px", background: "#ff971c", color: "#fff", border: "2px solid #000", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 0 2px #000", flexShrink: 0 }}
                  >
                    {sending ? "…" : "Senden"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Order detail sidebar ── */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #f3f4f6" }}>
            Bestelldetails
          </div>
          {!selected || !selected.order_id ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12, padding: 16, textAlign: "center" }}>
              Bestellung auswählen
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
              {/* Customer */}
              <div>
                <div style={{ fontWeight: 700, color: "#111827", marginBottom: 2 }}>Kunde</div>
                <div style={{ color: "#374151" }}>{[selected.order_first_name, selected.order_last_name].filter(Boolean).join(" ") || "—"}</div>
                <div style={{ color: "#6b7280", fontSize: 11 }}>{selected.order_email || "—"}</div>
              </div>
              {/* Status + Total */}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: 2 }}>Status</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#f3f4f6", color: "#374151" }}>
                    {statusLabel(selected.order_status)}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: 2 }}>Gesamt</div>
                  <div style={{ color: "#111827", fontWeight: 700 }}>{fmtCents(selected.order_total_cents)}</div>
                </div>
              </div>
              {/* Order items */}
              {orderItems.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>Artikel</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {orderItems.map((item, i) => (
                      <div key={item.id || i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid #e5e7eb", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 36, height: 36, background: "#f3f4f6", borderRadius: 4, flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.title || "—"}
                          </div>
                          <div style={{ color: "#6b7280", fontSize: 11 }}>
                            {item.quantity}× {fmtCents(item.unit_price_cents)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selected.order_id && (
                <a href={`/orders/${selected.order_id}`} style={{ display: "block", marginTop: 8, padding: "6px 12px", background: "#ff971c", color: "#fff", border: "2px solid #000", borderRadius: 8, fontWeight: 700, fontSize: 12, textAlign: "center", textDecoration: "none", boxShadow: "0 2px 0 2px #000" }}>
                  Bestellung öffnen →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
