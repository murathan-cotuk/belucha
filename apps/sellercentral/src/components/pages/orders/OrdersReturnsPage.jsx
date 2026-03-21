"use client";

import React, { useState, useEffect } from "react";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE");
}

const RETURN_STATUS_OPTIONS = ["offen", "genehmigt", "abgelehnt", "abgeschlossen"];

const STATUS_COLORS = {
  offen: { bg: "#fff7ed", color: "#c2410c" },
  genehmigt: { bg: "#f0fdf4", color: "#15803d" },
  abgelehnt: { bg: "#fef2f2", color: "#b91c1c" },
  abgeschlossen: { bg: "#f3f4f6", color: "#374151" },
};

function Badge({ value }) {
  const s = STATUS_COLORS[value] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {value || "—"}
    </span>
  );
}

function NewReturnModal({ onClose, onCreated }) {
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) { setError("Bestell-ID erforderlich"); return; }
    setSaving(true);
    try {
      const client = getMedusaAdminClient();
      const res = await client.createReturn({ order_id: orderId.trim(), reason, notes });
      onCreated(res?.return ?? res);
      onClose();
    } catch (err) {
      setError(err?.message || "Fehler");
    }
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,.2)", padding: 24 }} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>Neue Rückgabe</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Bestell-ID (UUID)</label>
            <input value={orderId} onChange={e => setOrderId(e.target.value)} style={inputStyle} placeholder="z.B. uuid-der-bestellung" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Grund</label>
            <input value={reason} onChange={e => setReason(e.target.value)} style={inputStyle} placeholder="z.B. Falsches Produkt, Defekt…" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Notizen</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, height: 72, resize: "vertical" }} placeholder="Optionale Anmerkungen…" />
          </div>
          {error && <div style={{ color: "#b91c1c", fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, cursor: "pointer", fontSize: 13 }}>Abbrechen</button>
            <button type="submit" disabled={saving} style={{ padding: "8px 20px", background: saving ? "#9ca3af" : "#111827", color: "#fff", border: "none", borderRadius: 7, cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
              {saving ? "Speichern…" : "Erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrdersReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const client = getMedusaAdminClient();
        const data = await client.getReturns();
        setReturns(data.returns || []);
      } catch { setReturns([]); }
      setLoading(false);
    })();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(u => ({ ...u, [id]: true }));
    try {
      const client = getMedusaAdminClient();
      const res = await client.updateReturn(id, { status: newStatus });
      const updated = res?.return;
      if (updated) setReturns(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
      else setReturns(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch { }
    setUpdating(u => ({ ...u, [id]: false }));
  };

  const COLS = ["#", "Bestellung", "Kunde", "Grund", "Status", "Datum", "Aktion"];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Rückgaben & Erstattungen</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Rückgabeanfragen verwalten</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{ padding: "8px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
        >
          + Neue Rückgabe
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {COLS.map((c, i) => (
                <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Laden…</td></tr>
            )}
            {!loading && returns.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "60px 20px", textAlign: "center", color: "#9ca3af" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>↩️</div>
                  <div>Keine Rückgabeanfragen</div>
                </td>
              </tr>
            )}
            {returns.map((ret) => (
              <tr
                key={ret.id}
                style={{ borderBottom: "1px solid #f3f4f6" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "#6b7280", fontSize: 11 }}>
                  {ret.return_number || ret.id?.slice(0, 8)}
                </td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                  {ret.order_number ? `#${ret.order_number}` : "—"}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 500 }}>{[ret.first_name, ret.last_name].filter(Boolean).join(" ") || "—"}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{ret.email || ""}</div>
                </td>
                <td style={{ padding: "10px 12px", color: "#6b7280", maxWidth: 180 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ret.reason || "—"}</div>
                  {ret.notes && <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ret.notes}</div>}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Badge value={ret.status} />
                </td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: "#6b7280" }}>{fmtDate(ret.created_at)}</td>
                <td style={{ padding: "10px 12px" }}>
                  <select
                    value={ret.status || "offen"}
                    onChange={e => handleStatusChange(ret.id, e.target.value)}
                    disabled={updating[ret.id]}
                    style={{ padding: "4px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, background: "#fff", cursor: "pointer" }}
                  >
                    {RETURN_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && (
        <NewReturnModal
          onClose={() => setShowNew(false)}
          onCreated={(r) => setReturns(prev => [r, ...prev])}
        />
      )}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
