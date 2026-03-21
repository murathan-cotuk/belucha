"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

function fmtCents(c) {
  return (Number(c || 0) / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €";
}

const CARRIERS = ["DHL", "DPD", "GLS", "UPS", "FedEx", "Hermes", "Go! Express", "Sonstige"];

export default function VersandPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "de";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scannedItems, setScannedItems] = useState({}); // { orderId: Set of scanned titles }
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanError, setScanError] = useState("");
  const [carrier, setCarrier] = useState("DHL");
  const [customCarrier, setCustomCarrier] = useState("");
  const [trackings, setTrackings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState({});
  const [phase, setPhase] = useState("scan"); // "scan" | "ship" | "done"
  const barcodeRef = useRef(null);

  useEffect(() => {
    // Load orders passed via sessionStorage or fetch pending orders
    const stored = sessionStorage.getItem("versand_orders");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOrders(parsed);
        // Pre-expand items for each
        loadItemsForOrders(parsed);
        sessionStorage.removeItem("versand_orders");
        setLoading(false);
        return;
      } catch { }
    }
    // Fetch orders that need shipping
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const client = getMedusaAdminClient();
      const data = await client.getOrders({ delivery_status: "offen", limit: 50 });
      const ordersData = data.orders || [];
      await loadItemsForOrders(ordersData);
    } catch { }
    setLoading(false);
  };

  const loadItemsForOrders = async (ordersData) => {
    const client = getMedusaAdminClient();
    const enriched = await Promise.all(ordersData.map(async (o) => {
      if (o._items) return o;
      try {
        const detail = await client.getOrder(o.id);
        return { ...o, _items: detail.order?.items || [] };
      } catch {
        return { ...o, _items: [] };
      }
    }));
    setOrders(enriched);
    // Init scanned state
    const init = {};
    for (const o of enriched) init[o.id] = new Set();
    setScannedItems(init);
    setLoading(false);
  };

  const currentOrder = orders[currentIndex];
  const items = currentOrder?._items || [];

  const getScanned = (orderId) => scannedItems[orderId] || new Set();

  const allItemsScanned = currentOrder
    ? items.every(it => getScanned(currentOrder.id).has(it.title || it.id))
    : false;

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!currentOrder || !barcodeInput.trim()) return;
    const val = barcodeInput.trim();
    setScanError("");

    // Find matching item by title or handle
    const match = items.find(it =>
      (it.title || "").toLowerCase().includes(val.toLowerCase()) ||
      (it.product_handle || "").toLowerCase().includes(val.toLowerCase()) ||
      val === (it.title || "") || val === (it.product_handle || "")
    );

    if (!match) {
      setScanError(`Artikel "${val}" nicht in dieser Bestellung gefunden.`);
      setBarcodeInput("");
      return;
    }

    setScannedItems(prev => {
      const s = new Set(prev[currentOrder.id] || []);
      s.add(match.title || match.id);
      return { ...prev, [currentOrder.id]: s };
    });
    setBarcodeInput("");
    // Refocus
    barcodeRef.current?.focus();
  };

  const markItemManually = (itemKey) => {
    if (!currentOrder) return;
    setScannedItems(prev => {
      const s = new Set(prev[currentOrder.id] || []);
      s.has(itemKey) ? s.delete(itemKey) : s.add(itemKey);
      return { ...prev, [currentOrder.id]: s };
    });
  };

  const goNext = () => {
    if (currentIndex < orders.length - 1) {
      setCurrentIndex(i => i + 1);
      setScanError("");
      setBarcodeInput("");
      setTimeout(() => barcodeRef.current?.focus(), 100);
    } else {
      setPhase("ship");
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const carrierName = carrier === "Sonstige" ? customCarrier : carrier;
    try {
      const client = getMedusaAdminClient();
      const newSaved = {};
      for (const o of orders) {
        await client.updateOrder(o.id, {
          delivery_status: "versendet",
          carrier_name: carrierName,
          tracking_number: trackings[o.id] || "",
        });
        newSaved[o.id] = true;
      }
      setSaved(newSaved);
      setPhase("done");
    } catch { }
    setSaving(false);
  };

  const handlePrintAll = () => {
    const carrierName = carrier === "Sonstige" ? customCarrier : carrier;
    const win = window.open("", "_blank", "width=900,height=700");
    const labels = orders.map(o => `
      <div style="page-break-inside:avoid;border:2px solid #000;padding:20px;margin-bottom:20px;width:90mm;font-family:Arial,sans-serif;box-sizing:border-box">
        <div style="font-size:10px;color:#666;margin-bottom:6px">VERSANDAUFKLEBER</div>
        <div style="font-size:16px;font-weight:bold;margin-bottom:10px">Bestellung #${o.order_number || "—"}</div>
        <div style="font-size:13px"><strong>${[o.first_name,o.last_name].filter(Boolean).join(" ")||"—"}</strong></div>
        <div style="font-size:12px">${o.address_line1||"—"}</div>
        <div style="font-size:12px">${[o.postal_code,o.city].filter(Boolean).join(" ")}</div>
        <div style="font-size:12px">${o.country||""}</div>
        <hr style="margin:10px 0">
        <div style="font-size:11px">Carrier: <strong>${carrierName}</strong></div>
        <div style="font-size:11px">Tracking: <strong>${trackings[o.id]||"—"}</strong></div>
        <div style="margin-top:10px;border:1px solid #ccc;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;letter-spacing:3px">${trackings[o.id]||"—"}</div>
      </div>
    `).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>Versandaufkleber</title><style>body{margin:20px;display:flex;flex-wrap:wrap;gap:16px}@media print{body{margin:0}}</style></head><body>${labels}<script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
  };

  const progress = orders.length > 0 ? Math.round(((currentIndex) / orders.length) * 100) : 0;

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Bestellungen werden geladen…</div>
  );

  if (orders.length === 0) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Keine Bestellungen zum Verpacken</h2>
      <p style={{ color: "#6b7280", fontSize: 14 }}>Alle Bestellungen wurden bereits versendet oder es gibt keine offenen Bestellungen.</p>
      <button onClick={() => router.push(`/${locale}/orders`)} style={{ marginTop: 16, padding: "9px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
        Zur Bestellübersicht
      </button>
    </div>
  );

  // === SHIP PHASE ===
  if (phase === "ship" || phase === "done") return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => setPhase("scan")} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>← Zurück</button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Versenden — {orders.length} Bestellung{orders.length !== 1 ? "en" : ""}</h1>
      </div>

      {phase === "done" && (
        <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, color: "#065f46" }}>Alle Bestellungen wurden als versendet markiert!</div>
            <div style={{ fontSize: 13, color: "#047857", marginTop: 2 }}>Trackingnummern wurden gespeichert.</div>
          </div>
        </div>
      )}

      {/* Carrier selection */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Versanddienstleister</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: carrier === "Sonstige" ? 10 : 0 }}>
          {CARRIERS.map(c => (
            <button key={c} onClick={() => setCarrier(c)} style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${carrier === c ? "#2563eb" : "#e5e7eb"}`, background: carrier === c ? "#eff6ff" : "#fff", color: carrier === c ? "#1d4ed8" : "#374151", fontSize: 13, cursor: "pointer", fontWeight: carrier === c ? 600 : 400 }}>
              {c}
            </button>
          ))}
        </div>
        {carrier === "Sonstige" && (
          <input value={customCarrier} onChange={e => setCustomCarrier(e.target.value)} placeholder="Carrier-Name…" style={{ padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, width: "100%", boxSizing: "border-box" }} />
        )}
      </div>

      {/* Tracking numbers */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Trackingnummern</div>
        {orders.map(o => (
          <div key={o.id} style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>#{o.order_number || "—"} — {[o.first_name,o.last_name].filter(Boolean).join(" ")||o.email||"—"}</div>
            <input
              value={trackings[o.id] || ""}
              onChange={e => setTrackings(t => ({ ...t, [o.id]: e.target.value }))}
              placeholder="Trackingnr. eingeben…"
              style={{ padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handlePrintAll} style={{ flex: 1, padding: "10px 0", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "#fff" }}>
          🖨 Versandaufkleber drucken
        </button>
        {phase !== "done" && (
          <button onClick={handleSaveAll} disabled={saving} style={{ flex: 1, padding: "10px 0", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
            {saving ? "Speichern…" : "Als versendet markieren"}
          </button>
        )}
        {phase === "done" && (
          <button onClick={() => router.push(`/${locale}/orders`)} style={{ flex: 1, padding: "10px 0", background: "#16a34a", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
            ✓ Zur Bestellübersicht
          </button>
        )}
      </div>
    </div>
  );

  // === SCAN PHASE ===
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => router.push(`/${locale}/orders`)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>← Zurück</button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Verpackungszentrum</h1>
        </div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          Bestellung {currentIndex + 1} von {orders.length}
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 6, background: "#e5e7eb", borderRadius: 4, marginBottom: 24, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#2563eb", borderRadius: 4, width: `${progress}%`, transition: "width 0.3s" }} />
      </div>

      {currentOrder && (
        <>
          {/* Order info */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Bestellung #{currentOrder.order_number || "—"}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                  {[currentOrder.first_name, currentOrder.last_name].filter(Boolean).join(" ") || "—"} · {currentOrder.email}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {[currentOrder.address_line1, currentOrder.city, currentOrder.country].filter(Boolean).join(", ")}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 18, fontWeight: 700 }}>{fmtCents(currentOrder.total_cents)}</div>
            </div>

            {/* Items checklist */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                Artikel ({getScanned(currentOrder.id).size}/{items.length} gescannt)
              </div>
              {items.map((it, i) => {
                const key = it.title || it.id;
                const scanned = getScanned(currentOrder.id).has(key);
                return (
                  <div
                    key={i}
                    onClick={() => markItemManually(key)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 8, cursor: "pointer", background: scanned ? "#f0fdf4" : "#fff", border: `1px solid ${scanned ? "#86efac" : "#e5e7eb"}`, marginBottom: 8, transition: "all 0.15s" }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: scanned ? "#16a34a" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {scanned ? <span style={{ color: "#fff", fontSize: 14 }}>✓</span> : <span style={{ color: "#9ca3af", fontSize: 14 }}>○</span>}
                    </div>
                    {it.thumbnail && <img src={it.thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: scanned ? 600 : 400, color: scanned ? "#15803d" : "#111827", textDecoration: scanned ? "line-through" : "none", opacity: scanned ? 0.7 : 1 }}>{it.title}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Menge: {it.quantity}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtCents(it.unit_price_cents)}</div>
                  </div>
                );
              })}
            </div>

            {/* Barcode scanner input */}
            <form onSubmit={handleBarcodeSubmit}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  ref={barcodeRef}
                  value={barcodeInput}
                  onChange={e => { setBarcodeInput(e.target.value); setScanError(""); }}
                  placeholder="Barcode scannen oder Artikelname eingeben…"
                  autoFocus
                  style={{ flex: 1, padding: "10px 14px", border: `1px solid ${scanError ? "#ef4444" : "#e5e7eb"}`, borderRadius: 8, fontSize: 14 }}
                />
                <button type="submit" style={{ padding: "10px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                  Scannen
                </button>
              </div>
              {scanError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{scanError}</div>}
            </form>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12 }}>
            {currentIndex > 0 && (
              <button onClick={() => { setCurrentIndex(i => i-1); setScanError(""); setBarcodeInput(""); }} style={{ padding: "10px 20px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "#fff" }}>
                ← Vorherige
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!allItemsScanned}
              style={{ flex: 1, padding: "10px 0", background: allItemsScanned ? (currentIndex === orders.length - 1 ? "#16a34a" : "#2563eb") : "#e5e7eb", color: allItemsScanned ? "#fff" : "#9ca3af", border: "none", borderRadius: 7, fontSize: 14, cursor: allItemsScanned ? "pointer" : "not-allowed", fontWeight: 600 }}
            >
              {!allItemsScanned
                ? `${items.length - getScanned(currentOrder.id).size} Artikel ausstehend…`
                : currentIndex === orders.length - 1
                  ? "✓ Alle verpackt — Versenden"
                  : `Nächste Bestellung →`
              }
            </button>
          </div>
          {!allItemsScanned && (
            <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
              Klicke auf einen Artikel oder scanne den Barcode um ihn als verpackt zu markieren
            </p>
          )}
        </>
      )}
    </div>
  );
}
