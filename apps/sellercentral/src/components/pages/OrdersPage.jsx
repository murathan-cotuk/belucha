"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

/* ── Helpers ─────────────────────────────────────────────────── */
function fmtCents(c) {
  return (Number(c || 0) / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €";
}
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  const date = dt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = dt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  return `${date} / ${time}`;
}

const ORDER_STATUS_OPTIONS = ["offen", "in_bearbeitung", "abgeschlossen", "storniert"];
const PAYMENT_STATUS_OPTIONS = ["offen", "bezahlt", "teil_erstattet", "erstattet"];
const DELIVERY_STATUS_OPTIONS = ["offen", "versendet", "zugestellt"];

const COUNTRY_VAT = {
  DE: { rate: 19, label: "MwSt." }, AT: { rate: 20, label: "MwSt." },
  CH: { rate: 7.7, label: "MWST" }, FR: { rate: 20, label: "TVA" },
  IT: { rate: 22, label: "IVA" }, ES: { rate: 21, label: "IVA" },
  TR: { rate: 20, label: "KDV" }, GB: { rate: 20, label: "VAT" }, US: { rate: 0, label: "Tax" },
};
function getVatInfo(country) {
  if (!country) return { rate: 19, label: "MwSt." };
  const c = String(country).toUpperCase().trim().slice(0, 2);
  return COUNTRY_VAT[c] || { rate: 19, label: "MwSt." };
}

const STATUS_COLORS = {
  offen: { bg: "#fff7ed", color: "#c2410c" },
  in_bearbeitung: { bg: "#eff6ff", color: "#1d4ed8" },
  abgeschlossen: { bg: "#f0fdf4", color: "#15803d" },
  storniert: { bg: "#fef2f2", color: "#b91c1c" },
  bezahlt: { bg: "#f0fdf4", color: "#15803d" },
  teil_erstattet: { bg: "#fffbeb", color: "#b45309" },
  erstattet: { bg: "#fef2f2", color: "#b91c1c" },
  versendet: { bg: "#eff6ff", color: "#1d4ed8" },
  zugestellt: { bg: "#f0fdf4", color: "#15803d" },
};

function StatusBadge({ value }) {
  const s = STATUS_COLORS[value] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {value || "—"}
    </span>
  );
}


function fmtCentsWithSymbol(c, symbol = "€") {
  const val = (Number(c || 0) / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 });
  return symbol === "€" ? val + " €" : symbol + " " + val;
}

function ExpandedRow({ order }) {
  const items = order._items || [];
  const subtotal = items.reduce((s, it) => s + (Number(it.unit_price_cents || 0) * Number(it.quantity || 1)), 0);
  const total = order.total_cents || order.subtotal_cents || 0;
  const vat = getVatInfo(order.country);
  const totalNetto = vat.rate > 0 ? Math.round(total / (1 + vat.rate / 100)) : total;
  const totalVat = total - totalNetto;

  return (
    <tr>
      <td colSpan={12} style={{ padding: 0, background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ padding: "10px 24px 14px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>Produkt</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Menge</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Einzelpreis (brutto)</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Gesamt (brutto)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "8px", color: "#9ca3af", textAlign: "center" }}>Keine Artikel</td></tr>
              )}
              {items.map((it, i) => {
                const itemBrutto = (it.unit_price_cents || 0) * (it.quantity || 1);
                const itemNetto = vat.rate > 0 ? Math.round(itemBrutto / (1 + vat.rate / 100)) : itemBrutto;
                return (
                  <tr key={i} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "6px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {it.thumbnail && <img src={it.thumbnail} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4 }} />}
                        <div>
                          <div>{it.title || "—"}</div>
                          {vat.rate > 0 && (
                            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                              Netto: {fmtCents(Math.round((it.unit_price_cents || 0) / (1 + vat.rate / 100)))} · +{vat.label} {vat.rate}%: {fmtCents(Math.round((it.unit_price_cents || 0) - (it.unit_price_cents || 0) / (1 + vat.rate / 100)))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right", padding: "6px 8px" }}>{it.quantity}</td>
                    <td style={{ textAlign: "right", padding: "6px 8px" }}>{fmtCents(it.unit_price_cents)}</td>
                    <td style={{ textAlign: "right", padding: "6px 8px", fontWeight: 600 }}>{fmtCents(itemBrutto)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {/* 1. Netto */}
              <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                <td colSpan={3} style={{ textAlign: "right", padding: "5px 8px", color: "#6b7280" }}>
                  Netto{vat.rate > 0 ? ` (exkl. ${vat.label})` : ""}
                </td>
                <td style={{ textAlign: "right", padding: "5px 8px" }}>{fmtCents(totalNetto)}</td>
              </tr>
              {/* 2. Vergi */}
              {vat.rate > 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "right", padding: "5px 8px", color: "#6b7280" }}>
                    {vat.label} ({vat.rate}%)
                  </td>
                  <td style={{ textAlign: "right", padding: "5px 8px" }}>{fmtCents(totalVat)}</td>
                </tr>
              )}
              {/* 3. Brutto Zwischensumme (bold) */}
              <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                <td colSpan={3} style={{ textAlign: "right", padding: "6px 8px", fontWeight: 700 }}>Zwischensumme (brutto)</td>
                <td style={{ textAlign: "right", padding: "6px 8px", fontWeight: 700 }}>{fmtCents(subtotal)}</td>
              </tr>
              {/* 4. Versandkosten */}
              <tr>
                <td colSpan={3} style={{ textAlign: "right", padding: "5px 8px", color: "#6b7280" }}>Versandkosten</td>
                <td style={{ textAlign: "right", padding: "5px 8px" }}>Kostenlos</td>
              </tr>
              {/* 5. Rabatt */}
              <tr>
                <td colSpan={3} style={{ textAlign: "right", padding: "5px 8px", color: "#6b7280" }}>Rabatt</td>
                <td style={{ textAlign: "right", padding: "5px 8px" }}>—</td>
              </tr>
              {/* 6. Gesamtkosten (bolder) */}
              <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                <td colSpan={3} style={{ textAlign: "right", padding: "7px 8px", fontWeight: 800, fontSize: 13 }}>Gesamtkosten</td>
                <td style={{ textAlign: "right", padding: "7px 8px", fontWeight: 800, fontSize: 13 }}>{fmtCents(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </td>
    </tr>
  );
}

function CustomerCell({ order, locale, router }) {
  const [navigating, setNavigating] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (navigating) return;
    if (order.customer_id) {
      router.push(`/customers/${order.customer_id}`);
      return;
    }
    if (!order.email) return;
    setNavigating(true);
    try {
      const client = getMedusaAdminClient();
      const data = await client.getCustomers({ search: order.email, limit: 1 });
      const found = data?.customers?.[0];
      if (found?.id) router.push(`/customers/${found.id}`);
    } catch { }
    setNavigating(false);
  };

  const name = [order.first_name, order.last_name].filter(Boolean).join(" ") || "—";
  const label = order.customer_number ? `${order.customer_number} – ${name}` : name;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
        <button
          onClick={handleClick}
          style={{ background: "none", border: "none", padding: 0, cursor: navigating ? "wait" : "pointer", textAlign: "left", fontWeight: 600, fontSize: 13, color: navigating ? "#9ca3af" : "#111827", textDecoration: "underline" }}
        >
          {label}
        </button>
        {order.is_guest && (
          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "#f3f4f6", color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>
            Gast
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af" }}>{order.email || ""}</div>
    </div>
  );
}

function ActionMenu({ order, onUpdate, onDelete, onVersenden }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, bottom: "auto", right: 0, openUp: false });
  const router = useRouter();
  const ref = React.useRef(null);
  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && ref.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 220;
      setPos({
        top: openUp ? "auto" : rect.bottom + 4,
        bottom: openUp ? (window.innerHeight - rect.top + 4) : "auto",
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(o => !o);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }} onMouseDown={e => e.stopPropagation()}>
      <button ref={btnRef} onClick={handleToggle} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 16, color: "#6b7280" }}>⋯</button>
      {open && (
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, bottom: pos.bottom, right: pos.right, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,.1)", zIndex: 9999, minWidth: 170, overflow: "hidden" }}>
          {[
            { label: "Details anzeigen", action: () => { router.push(`/orders/${order.id}`); setOpen(false); } },
            { label: "Als zugestellt markieren", action: () => { onUpdate(order.id, { delivery_status: "zugestellt" }); setOpen(false); } },
            { label: "Als bezahlt markieren", action: () => { onUpdate(order.id, { payment_status: "bezahlt" }); setOpen(false); } },
            { label: "Abschließen", action: () => { onUpdate(order.id, { order_status: "abgeschlossen" }); setOpen(false); } },
            { label: "Stornieren", action: () => { onUpdate(order.id, { order_status: "storniert" }); setOpen(false); }, danger: true },
            { label: "Löschen", action: () => { if (confirm("Bestellung löschen?")) { onDelete(order.id); } setOpen(false); }, danger: true },
          ].map((item, i, arr) => (
            <button key={i} onClick={item.action} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 16px", background: "none", border: "none", fontSize: 13, cursor: "pointer", color: item.danger ? "#b91c1c" : "#111827", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VersendModal({ orders, onClose, onDone }) {
  const [carrier, setCarrier] = useState("DHL");
  const [customCarrier, setCustomCarrier] = useState("");
  const [trackings, setTrackings] = useState(() => Object.fromEntries(orders.map(o => [o.id, ""])));
  const [saving, setSaving] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const carrierName = carrier === "Sonstige" ? customCarrier : carrier;

  const handleSave = async () => {
    setSaving(true);
    try {
      const client = getMedusaAdminClient();
      for (const o of orders) {
        await client.updateOrder(o.id, {
          delivery_status: "versendet",
          carrier_name: carrierName,
          tracking_number: trackings[o.id] || "",
        });
      }
      setSaved(true);
      onDone();
    } catch { }
    setSaving(false);
  };

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=800,height=600");
    const date = new Date().toLocaleDateString("de-DE");
    const labelsHtml = orders.map(o => `
      <div class="label" style="page-break-inside:avoid;border:2px solid #000;padding:20px;margin-bottom:20px;font-family:Arial,sans-serif;width:90mm;box-sizing:border-box;">
        <div style="font-size:11px;color:#666;margin-bottom:8px">VERSANDAUFKLEBER / LIEFERSCHEIN</div>
        <div style="font-size:18px;font-weight:bold;margin-bottom:12px">Bestellung #${o.order_number || "—"}</div>
        <div style="font-size:13px;margin-bottom:4px"><strong>${[o.first_name, o.last_name].filter(Boolean).join(" ") || "—"}</strong></div>
        <div style="font-size:12px">${o.address_line1 || "—"}</div>
        <div style="font-size:12px">${[o.postal_code, o.city].filter(Boolean).join(" ")}</div>
        <div style="font-size:12px">${o.country || "—"}</div>
        <hr style="margin:12px 0">
        <div style="font-size:11px;color:#666">Versanddienstleister: <strong>${carrierName}</strong></div>
        <div style="font-size:11px;color:#666">Trackingnummer: <strong>${trackings[o.id] || "—"}</strong></div>
        <div style="font-size:11px;color:#666">Datum: ${date}</div>
        <div style="margin-top:12px;border:1px solid #ccc;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;letter-spacing:4px">${trackings[o.id] || "—"}</div>
      </div>
    `).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>Versandaufkleber</title><style>@media print{body{margin:0}} body{margin:20px;display:flex;flex-wrap:wrap;gap:16px}</style></head><body>${labelsHtml}<script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
  };

  const handlePrintLieferschein = () => {
    const win = window.open("", "_blank", "width=900,height=700");
    const date = new Date().toLocaleDateString("de-DE");
    const sheets = orders.map(o => `
      <div style="page-break-inside:avoid;padding:30px;font-family:Arial,sans-serif;border-bottom:2px dashed #ccc;margin-bottom:20px">
        <h2 style="margin:0 0 16px">Lieferschein — Bestellung #${o.order_number || "—"}</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
          <div>
            <div style="font-size:11px;text-transform:uppercase;color:#666;margin-bottom:4px">Lieferadresse</div>
            <div><strong>${[o.first_name, o.last_name].filter(Boolean).join(" ") || "—"}</strong></div>
            <div>${o.address_line1 || "—"}</div>
            <div>${[o.postal_code, o.city].filter(Boolean).join(" ")}</div>
            <div>${o.country || ""}</div>
          </div>
          <div>
            <div style="font-size:11px;text-transform:uppercase;color:#666;margin-bottom:4px">Versandinformation</div>
            <div>Datum: ${date}</div>
            <div>Carrier: ${carrierName}</div>
            <div>Tracking: ${trackings[o.id] || "—"}</div>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left;border:1px solid #ddd">Artikel</th>
              <th style="padding:8px;text-align:center;border:1px solid #ddd">Menge</th>
            </tr>
          </thead>
          <tbody>
            ${(o._items || []).map(it => `<tr><td style="padding:8px;border:1px solid #ddd">${it.title || "—"}</td><td style="padding:8px;text-align:center;border:1px solid #ddd">${it.quantity}</td></tr>`).join("") || `<tr><td colspan="2" style="padding:8px;border:1px solid #ddd;color:#666">Keine Artikel</td></tr>`}
          </tbody>
        </table>
      </div>
    `).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>Lieferschein</title><style>@media print{.noprint{display:none}}</style></head><body>${sheets}<script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
  };

  const inp = { padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Versenden — {orders.length} Bestellung{orders.length !== 1 ? "en" : ""}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          {/* Carrier */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Versanddienstleister</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["DHL", "DPD", "GLS", "UPS", "FedEx", "Hermes", "Go! Express", "Sonstige"].map(c => (
                <button key={c} onClick={() => setCarrier(c)} style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${carrier === c ? "#2563eb" : "#e5e7eb"}`, background: carrier === c ? "#eff6ff" : "#fff", color: carrier === c ? "#1d4ed8" : "#374151", fontSize: 13, cursor: "pointer", fontWeight: carrier === c ? 600 : 400 }}>
                  {c}
                </button>
              ))}
            </div>
            {carrier === "Sonstige" && (
              <input style={{ ...inp, marginTop: 8 }} value={customCarrier} onChange={e => setCustomCarrier(e.target.value)} placeholder="Carrier-Name eingeben…" />
            )}
          </div>

          {/* Tracking numbers */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Trackingnummern</label>
            {orders.map(o => (
              <div key={o.id} style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 10, marginBottom: 8, alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  #{o.order_number || "—"} — {[o.first_name, o.last_name].filter(Boolean).join(" ") || o.email || "—"}
                </div>
                <input
                  style={inp}
                  value={trackings[o.id] || ""}
                  onChange={e => setTrackings(t => ({ ...t, [o.id]: e.target.value }))}
                  placeholder="Trackingnr. eingeben…"
                />
              </div>
            ))}
          </div>

          {saved && (
            <div style={{ background: "#d1fae5", color: "#065f46", padding: "10px 14px", borderRadius: 7, fontSize: 13, marginBottom: 16 }}>
              ✓ Bestellungen wurden als versendet markiert und Trackingnummern gespeichert.
            </div>
          )}

          {/* Print buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
            <button onClick={handlePrint} style={{ flex: 1, padding: "9px 0", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "#fff", fontWeight: 500 }}>
              🖨 Versandaufkleber drucken
            </button>
            <button onClick={handlePrintLieferschein} style={{ flex: 1, padding: "9px 0", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "#fff", fontWeight: 500 }}>
              📋 Lieferschein drucken
            </button>
          </div>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 10, position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "#fff" }}>Schließen</button>
          <button onClick={handleSave} disabled={saving || saved} style={{ padding: "8px 18px", background: saved ? "#16a34a" : "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
            {saving ? "Speichern…" : saved ? "✓ Gespeichert" : "Als versendet markieren"}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_ORDER_FORM = {
  email: "", first_name: "", last_name: "", phone: "", country: "DE",
  address_line1: "", zip_code: "", city: "",
  order_status: "offen", payment_status: "offen", delivery_status: "offen",
  payment_method: "", currency: "EUR", notes: "",
  shipping_cents: "", discount_cents: "",
  items: [{ title: "", quantity: 1, unit_price_cents: "" }],
};

function ManualOrderModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_ORDER_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setForm(f => {
    const items = [...f.items];
    items[i] = { ...items[i], [k]: v };
    return { ...f, items };
  });
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { title: "", quantity: 1, unit_price_cents: "" }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const itemsTotal = form.items.reduce((s, it) => s + (Number(it.unit_price_cents||0) * Number(it.quantity||1)), 0);
  const total = itemsTotal + Number(form.shipping_cents||0) - Number(form.discount_cents||0);

  const handleSave = async () => {
    if (!form.email) { setErr("E-Mail ist erforderlich"); return; }
    setSaving(true); setErr("");
    try {
      const client = getMedusaAdminClient();
      const payload = {
        ...form,
        items: form.items.filter(it => it.title),
        shipping_cents: Number(form.shipping_cents||0),
        discount_cents: Number(form.discount_cents||0),
      };
      await client.createOrder(payload);
      onCreated();
      onClose();
    } catch (e) { setErr(e?.message || "Fehler"); }
    setSaving(false);
  };

  const inp = { padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 12, color: "#374151", fontWeight: 500, display: "block", marginBottom: 3 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Manuelle Bestellung</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          {/* Customer */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>Kundendaten</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1/-1" }}><label style={lbl}>E-Mail *</label><input style={inp} value={form.email} onChange={e => setF("email", e.target.value)} /></div>
              <div><label style={lbl}>Vorname</label><input style={inp} value={form.first_name} onChange={e => setF("first_name", e.target.value)} /></div>
              <div><label style={lbl}>Nachname</label><input style={inp} value={form.last_name} onChange={e => setF("last_name", e.target.value)} /></div>
              <div><label style={lbl}>Telefon</label><input style={inp} value={form.phone} onChange={e => setF("phone", e.target.value)} /></div>
              <div><label style={lbl}>Land</label><input style={inp} value={form.country} onChange={e => setF("country", e.target.value)} placeholder="DE" /></div>
              <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Straße</label><input style={inp} value={form.address_line1} onChange={e => setF("address_line1", e.target.value)} /></div>
              <div><label style={lbl}>PLZ</label><input style={inp} value={form.zip_code} onChange={e => setF("zip_code", e.target.value)} /></div>
              <div><label style={lbl}>Stadt</label><input style={inp} value={form.city} onChange={e => setF("city", e.target.value)} /></div>
            </div>
          </div>

          {/* Items */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Artikel</div>
            {form.items.map((it, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px 32px", gap: 8, marginBottom: 8, alignItems: "end" }}>
                <div><label style={{ ...lbl, visibility: i > 0 ? "hidden" : "visible" }}>Bezeichnung</label><input style={inp} value={it.title} onChange={e => setItem(i, "title", e.target.value)} placeholder="Produktname" /></div>
                <div><label style={{ ...lbl, visibility: i > 0 ? "hidden" : "visible" }}>Menge</label><input style={inp} type="number" min="1" value={it.quantity} onChange={e => setItem(i, "quantity", e.target.value)} /></div>
                <div><label style={{ ...lbl, visibility: i > 0 ? "hidden" : "visible" }}>Preis (Cent)</label><input style={inp} type="number" value={it.unit_price_cents} onChange={e => setItem(i, "unit_price_cents", e.target.value)} placeholder="1990" /></div>
                <button onClick={() => removeItem(i)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 5, cursor: "pointer", color: "#9ca3af", height: 34 }}>×</button>
              </div>
            ))}
            <button onClick={addItem} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0 }}>+ Artikel hinzufügen</button>
          </div>

          {/* Costs */}
          <div style={{ marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Versand (Cent)</label><input style={inp} type="number" value={form.shipping_cents} onChange={e => setF("shipping_cents", e.target.value)} placeholder="0" /></div>
            <div><label style={lbl}>Rabatt (Cent)</label><input style={inp} type="number" value={form.discount_cents} onChange={e => setF("discount_cents", e.target.value)} placeholder="0" /></div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Bestellstatus</label>
              <select style={inp} value={form.order_status} onChange={e => setF("order_status", e.target.value)}>
                {["offen","in_bearbeitung","abgeschlossen","storniert"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Zahlungsstatus</label>
              <select style={inp} value={form.payment_status} onChange={e => setF("payment_status", e.target.value)}>
                {["offen","bezahlt","teil_erstattet","erstattet"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Lieferstatus</label>
              <select style={inp} value={form.delivery_status} onChange={e => setF("delivery_status", e.target.value)}>
                {["offen","versendet","zugestellt"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Zahlungsmethode</label><input style={inp} value={form.payment_method} onChange={e => setF("payment_method", e.target.value)} placeholder="Überweisung, PayPal…" /></div>
            <div><label style={lbl}>Währung</label>
              <select style={inp} value={form.currency} onChange={e => setF("currency", e.target.value)}>
                {["EUR","CHF","USD","GBP","TRY"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}><label style={lbl}>Notizen</label><textarea style={{ ...inp, height: 60, resize: "vertical" }} value={form.notes} onChange={e => setF("notes", e.target.value)} /></div>

          {/* Summary */}
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 16px", fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 4 }}>
              <span>Zwischensumme</span><span>{(itemsTotal/100).toLocaleString("de-DE", {minimumFractionDigits:2})} {form.currency}</span>
            </div>
            {Number(form.shipping_cents||0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 4 }}>
                <span>Versand</span><span>+{(Number(form.shipping_cents)/100).toLocaleString("de-DE", {minimumFractionDigits:2})} {form.currency}</span>
              </div>
            )}
            {Number(form.discount_cents||0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#059669", marginBottom: 4 }}>
                <span>Rabatt</span><span>−{(Number(form.discount_cents)/100).toLocaleString("de-DE", {minimumFractionDigits:2})} {form.currency}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 4 }}>
              <span>Gesamt</span><span>{(total/100).toLocaleString("de-DE", {minimumFractionDigits:2})} {form.currency}</span>
            </div>
          </div>
        </div>

        {err && <div style={{ margin: "0 24px 12px", color: "#ef4444", fontSize: 12 }}>{err}</div>}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 10, position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "#fff" }}>Abbrechen</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
            {saving ? "Speichern…" : "Bestellung erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "de";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOrderStatus, setFilterOrderStatus] = useState("");
  const [filterPayStatus, setFilterPayStatus] = useState("");
  const [filterDelivery, setFilterDelivery] = useState("");
  const [sort, setSort] = useState("created_at_desc");
  const [expanded, setExpanded] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [versendModal, setVersendModal] = useState(null); // null | array of order objects

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const client = getMedusaAdminClient();
      const params = { sort };
      if (search) params.search = search;
      if (filterOrderStatus) params.order_status = filterOrderStatus;
      if (filterPayStatus) params.payment_status = filterPayStatus;
      if (filterDelivery) params.delivery_status = filterDelivery;
      const data = await client.getOrders(params);
      setOrders(data.orders || []);
    } catch { setOrders([]); }
    setLoading(false);
  }, [search, filterOrderStatus, filterPayStatus, filterDelivery, sort]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const toggleExpand = async (order) => {
    const id = order.id;
    if (expanded[id]) { setExpanded(e => ({ ...e, [id]: false })); return; }
    if (order._expanded) { setExpanded(e => ({ ...e, [id]: true })); return; }
    setLoadingItems(l => ({ ...l, [id]: true }));
    try {
      const client = getMedusaAdminClient();
      const data = await client.getOrder(id);
      const detail = data.order || {};
      setOrders(prev => prev.map(o => o.id === id ? {
        ...o,
        _items: detail.items || [],
        _customer_number: detail.customer_number || null,
        _is_guest: detail.is_guest !== false,
        _payment_method: detail.payment_method || null,
        _is_first_order: detail.is_first_order === true,
        _expanded: true,
      } : o));
    } catch { }
    setLoadingItems(l => ({ ...l, [id]: false }));
    setExpanded(e => ({ ...e, [id]: true }));
  };

  const handleUpdate = async (id, data) => {
    try {
      const client = getMedusaAdminClient();
      const res = await client.updateOrder(id, data);
      if (res?.order) setOrders(prev => prev.map(o => o.id === id ? { ...o, ...res.order } : o));
    } catch { }
  };


  const handleDelete = async (id) => {
    try {
      const client = getMedusaAdminClient();
      await client.deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch { }
  };

  const COLS = ["☐", "", "Bestellnummer", "Kunde", "Adresse", "Betrag", "Bestellstatus", "Zahlungsstatus", "Lieferstatus", "Datum", "Land", ""];

  const allSelected = orders.length > 0 && orders.every(o => selected.has(o.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(orders.map(o => o.id)));
  };
  const toggleOne = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectedOrders = orders.filter(o => selected.has(o.id));

  return (
    <div style={{ padding: 24, background: "#fff", minHeight: "100%" }}>
      {showNewOrder && (
        <ManualOrderModal
          onClose={() => setShowNewOrder(false)}
          onCreated={() => fetchOrders()}
        />
      )}
      {versendModal && (
        <VersendModal
          orders={versendModal}
          onClose={() => setVersendModal(null)}
          onDone={() => { fetchOrders(); setSelected(new Set()); }}
        />
      )}
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Bestellungen</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>{orders.length} Bestellungen</span>
          <button
            onClick={() => setShowNewOrder(true)}
            style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            + Bestellung hinzufügen
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "#eff6ff", borderRadius: 8, marginBottom: 12, border: "1px solid #bfdbfe" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>{selected.size} ausgewählt</span>
          <button
            onClick={() => setVersendModal(selectedOrders)}
            style={{ padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            📦 Versenden
          </button>
          <button
            onClick={() => {
              sessionStorage.setItem("versand_orders", JSON.stringify(selectedOrders));
              router.push(`/${locale}/versand`);
            }}
            style={{ padding: "7px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            🏭 Verpackungszentrum
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{ padding: "7px 12px", background: "none", border: "1px solid #bfdbfe", borderRadius: 7, fontSize: 13, cursor: "pointer", color: "#374151" }}
          >
            Auswahl aufheben
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Suche nach Name, Email, #..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "7px 12px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13 }}
        />
        <select value={filterOrderStatus} onChange={e => setFilterOrderStatus(e.target.value)} style={selStyle}>
          <option value="">Alle Status</option>
          {ORDER_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPayStatus} onChange={e => setFilterPayStatus(e.target.value)} style={selStyle}>
          <option value="">Alle Zahlungen</option>
          {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterDelivery} onChange={e => setFilterDelivery(e.target.value)} style={selStyle}>
          <option value="">Alle Lieferungen</option>
          {DELIVERY_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={selStyle}>
          <option value="created_at_desc">Neueste zuerst</option>
          <option value="created_at_asc">Älteste zuerst</option>
          <option value="order_number_desc">Bestellnr. ↓</option>
          <option value="total_desc">Betrag ↓</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {COLS.map((c, i) => (
                <th key={i} style={{ padding: "10px 12px", textAlign: i >= 5 && i <= 10 ? "center" : "left", fontWeight: 600, fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {i === 0 ? (
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: "pointer" }} />
                  ) : c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={12} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Laden…</td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={12} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Keine Bestellungen gefunden</td></tr>
            )}
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr style={{ borderBottom: "1px solid #f3f4f6", cursor: "default", background: selected.has(order.id) ? "#f0f9ff" : "" }}
                  onMouseEnter={e => { if (!selected.has(order.id)) e.currentTarget.style.background = "#fafafa"; }}
                  onMouseLeave={e => { if (!selected.has(order.id)) e.currentTarget.style.background = ""; }}
                >
                  {/* Checkbox */}
                  <td style={{ padding: "10px 8px 10px 12px", width: 32 }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(order.id)} onChange={() => toggleOne(order.id)} style={{ cursor: "pointer" }} />
                  </td>
                  {/* Expand toggle */}
                  <td style={{ padding: "10px 8px 10px 0", width: 32 }}>
                    <button onClick={() => toggleExpand(order)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6b7280", padding: 0 }}>
                      {loadingItems[order.id] ? "…" : expanded[order.id] ? "▼" : "▶"}
                    </button>
                  </td>
                  {/* Order number */}
                  <td style={{ padding: "10px 12px", fontWeight: 600, fontSize: 13 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/${locale}/orders/${order.id}`); }}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#111827", textDecoration: "underline" }}
                    >
                      #{order.order_number || "—"}
                    </button>
                  </td>
                  {/* Customer */}
                  <td style={{ padding: "10px 12px", minWidth: 240, maxWidth: 280 }}>
                    <CustomerCell order={order} locale={locale} router={router} />
                  </td>
                  {/* Address */}
                  <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: 12, lineHeight: 1.5 }}>
                    {order.address_line1 ? (
                      <>
                        <div>{order.address_line1}</div>
                        <div>{[order.postal_code, order.city].filter(Boolean).join(" ")}</div>
                        {order.country && <div>{order.country}</div>}
                      </>
                    ) : "—"}
                  </td>
                  {/* Amount with VAT breakdown */}
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>
                    {(() => {
                      const vat = getVatInfo(order.country);
                      const brutto = order.total_cents || 0;
                      const netto = vat.rate > 0 ? Math.round(brutto / (1 + vat.rate / 100)) : brutto;
                      return (
                        <>
                          <div>{fmtCents(brutto)}</div>
                          {vat.rate > 0 && (
                            <div style={{ fontSize: 10, fontWeight: 400, color: "#9ca3af", lineHeight: 1.3 }}>
                              {fmtCents(netto)} netto<br />
                              +{vat.rate}% {vat.label}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </td>
                  {/* Order status */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <StatusBadge value={order.order_status} />
                  </td>
                  {/* Payment status */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <StatusBadge value={order.payment_status} />
                  </td>
                  {/* Delivery status */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <StatusBadge value={order.delivery_status} />
                  </td>
                  {/* Date */}
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                    {fmtDate(order.created_at)}
                  </td>
                  {/* Country */}
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 500 }}>
                    {order.country || "—"}
                  </td>
                  {/* Actions */}
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                      {order.delivery_status !== "versendet" && order.delivery_status !== "zugestellt" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setVersendModal([order]); }}
                          style={{ padding: "4px 10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, fontSize: 12, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                        >
                          Versenden
                        </button>
                      )}
                      <ActionMenu order={order} onUpdate={handleUpdate} onDelete={handleDelete} />
                    </div>
                  </td>
                </tr>
                {expanded[order.id] && <ExpandedRow order={order} />}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const selStyle = { padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, background: "#fff", cursor: "pointer" };
