"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthGuard, getToken } from "@belucha/lib";
import { useRouter } from "@/i18n/navigation";
import ShopHeader from "@/components/ShopHeader";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";
import { getMedusaClient } from "@/lib/medusa-client";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function groupByOrder(messages) {
  const map = {};
  for (const m of messages) {
    const key = m.order_id || "__no_order__";
    if (!map[key]) {
      map[key] = {
        order_id: m.order_id,
        order_number: m.order_number,
        order_status: m.order_status,
        messages: [],
      };
    }
    map[key].messages.push(m);
  }
  return Object.values(map)
    .map((t) => ({ ...t, messages: [...t.messages].sort((a, b) => (a.created_at || "").localeCompare(b.created_at || "")) }))
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.created_at || "";
      const bLast = b.messages[b.messages.length - 1]?.created_at || "";
      return bLast.localeCompare(aLast);
    });
}

export default function NachrichtenPage() {
  useAuthGuard({ requiredRole: "customer", redirectTo: "/login" });

  const router = useRouter();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken("customer");
      const data = await getMedusaClient().request("/store/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!data?.__error) setThreads(groupByOrder(data?.messages || []));
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [selected?.messages?.length]);

  const handleSelectThread = (thread) => {
    setSelected(thread);
    setReply("");
    setErr("");
    setSent(false);
  };

  const handleSend = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    setErr("");
    setSent(false);
    try {
      const token = getToken("customer");
      await getMedusaClient().request("/store/messages", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selected.order_id || undefined,
          body: reply.trim(),
          subject: selected.order_number ? `Re: Bestellung #${selected.order_number}` : "Nachricht",
        }),
      });
      setReply("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      // Refresh
      const data = await getMedusaClient().request("/store/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!data?.__error) {
        const updated = groupByOrder(data?.messages || []);
        setThreads(updated);
        const key = selected.order_id || "__no_order__";
        const updatedThread = updated.find((t) => (t.order_id || "__no_order__") === key);
        if (updatedThread) setSelected(updatedThread);
      }
    } catch (e) {
      setErr(e?.message || "Fehler");
    }
    setSending(false);
  };

  const unreadCount = (thread) =>
    thread.messages.filter((m) => m.sender_type === "seller" && !m.is_read_by_customer).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <ShopHeader />
      <div style={{ flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "32px 16px", paddingTop: 128, display: "flex", gap: 24, alignItems: "flex-start" }}>
        <AccountSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 20px" }}>Nachrichten</h1>

          {loading ? (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Laden…</div>
          ) : threads.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
              Noch keine Nachrichten
            </div>
          ) : selected ? (
            /* ── Thread view ── */
            <div style={{ background: "#fff", border: "2px solid #000", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 0 2px #000" }}>
              {/* Header */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280", padding: "0 4px", lineHeight: 1 }}
                >
                  ←
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    {selected.order_number ? `Bestellung #${selected.order_number}` : "Allgemeine Nachricht"}
                  </div>
                  {selected.order_id && (
                    <div
                      onClick={() => router.push(`/order/${selected.order_id}`)}
                      style={{ fontSize: 11, color: "#ff971c", cursor: "pointer", fontWeight: 600, marginTop: 1 }}
                    >
                      Bestellung ansehen →
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10, minHeight: 200, maxHeight: 420, overflowY: "auto" }}>
                {selected.messages.map((m) => {
                  const isCustomer = m.sender_type === "customer";
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: isCustomer ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "75%",
                        background: isCustomer ? "#ff971c" : "#f3f4f6",
                        color: isCustomer ? "#fff" : "#111827",
                        borderRadius: isCustomer ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        padding: "9px 13px",
                        fontSize: 13,
                      }}>
                        {!isCustomer && (
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#ff971c", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".04em" }}>Shop</div>
                        )}
                        <div style={{ lineHeight: 1.5 }}>{m.body}</div>
                        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6 }}>{fmtDate(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply box */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6" }}>
                {sent && <div style={{ color: "#15803d", fontSize: 12, marginBottom: 6 }}>Nachricht gesendet ✓</div>}
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
                    style={{ padding: "0 18px", background: "#ff971c", color: "#fff", border: "2px solid #000", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 0 2px #000", flexShrink: 0 }}
                  >
                    {sending ? "…" : "Senden"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Thread list ── */
            <div style={{ background: "#fff", border: "2px solid #000", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 0 2px #000" }}>
              {threads.map((thread, idx) => {
                const last = thread.messages[thread.messages.length - 1];
                const unread = unreadCount(thread);
                return (
                  <button
                    key={thread.order_id || "__no_order__"}
                    onClick={() => handleSelectThread(thread)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 18px",
                      background: "#fff",
                      border: "none",
                      borderBottom: idx < threads.length - 1 ? "1px solid #f3f4f6" : "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      transition: "background .12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff7ed")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    {/* Orange circle icon */}
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff7ed", border: "2px solid #ff971c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>
                      💬
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                          {thread.order_number ? `Bestellung #${thread.order_number}` : "Allgemeine Nachricht"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          {unread > 0 && (
                            <span style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", fontSize: 10, fontWeight: 800, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {unread}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(last?.created_at)}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {last?.sender_type === "seller" ? "Shop: " : "Du: "}{last?.body?.slice(0, 80) || "—"}
                      </div>
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 16, flexShrink: 0 }}>›</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
