"use client";

import React, { useState, useEffect } from "react";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

const PRESET_CARRIERS = [
  { name: "DHL", tracking_url_template: "https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode={tracking}" },
  { name: "DPD", tracking_url_template: "https://tracking.dpd.de/parcelstatus?query={tracking}" },
  { name: "GLS", tracking_url_template: "https://gls-group.com/track/{tracking}" },
  { name: "UPS", tracking_url_template: "https://www.ups.com/track?tracknum={tracking}" },
  { name: "FedEx", tracking_url_template: "https://www.fedex.com/fedextrack/?trknbr={tracking}" },
  { name: "Hermes", tracking_url_template: "https://www.myhermes.de/empfangen/sendungsverfolgung/#/{tracking}" },
  { name: "Go! Express", tracking_url_template: "" },
  { name: "USPS", tracking_url_template: "https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking}" },
];

const EMPTY_FORM = { name: "", tracking_url_template: "", api_key: "", api_secret: "", is_active: true, sort_order: 0 };

export default function ShippingSettingsPage() {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: "create" | "edit", carrier? }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    const client = getMedusaAdminClient();
    const data = await client.getCarriers();
    setCarriers(data.carriers || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = (preset) => {
    setForm(preset ? { ...EMPTY_FORM, name: preset.name, tracking_url_template: preset.tracking_url_template } : EMPTY_FORM);
    setModal({ mode: "create" });
    setErr("");
  };

  const openEdit = (c) => {
    setForm({ name: c.name, tracking_url_template: c.tracking_url_template || "", api_key: c.api_key || "", api_secret: c.api_secret || "", is_active: c.is_active !== false, sort_order: c.sort_order || 0 });
    setModal({ mode: "edit", carrier: c });
    setErr("");
  };

  const handleSave = async () => {
    if (!form.name) { setErr("Name ist erforderlich"); return; }
    setSaving(true); setErr("");
    try {
      const client = getMedusaAdminClient();
      if (modal.mode === "edit") {
        const res = await client.updateCarrier(modal.carrier.id, form);
        setCarriers(prev => prev.map(c => c.id === modal.carrier.id ? { ...c, ...(res.carrier || {}) } : c));
      } else {
        const res = await client.createCarrier(form);
        if (res.carrier) setCarriers(prev => [...prev, res.carrier]);
      }
      setModal(null);
    } catch (e) { setErr(e?.message || "Fehler"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Carrier löschen?")) return;
    const client = getMedusaAdminClient();
    await client.deleteCarrier(id);
    setCarriers(prev => prev.filter(c => c.id !== id));
  };

  const handleToggle = async (c) => {
    const client = getMedusaAdminClient();
    await client.updateCarrier(c.id, { is_active: !c.is_active });
    setCarriers(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x));
  };

  const inp = { padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 3 };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Versand & Lieferung</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Versanddienstleister verwalten und Tracking-URLs konfigurieren.</p>
        </div>
        <button onClick={() => openCreate()} style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Carrier hinzufügen
        </button>
      </div>

      {/* Presets */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Schnellstart — Vorkonfigurierte Carrier</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESET_CARRIERS.map(p => (
            <button key={p.name} onClick={() => openCreate(p)} style={{ padding: "6px 14px", border: "1px solid #e5e7eb", borderRadius: 20, fontSize: 13, cursor: "pointer", background: "#fff" }}>
              + {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Carrier list */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        {loading && <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Laden…</div>}
        {!loading && carriers.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            Noch keine Carrier konfiguriert. Füge deinen ersten Versanddienstleister hinzu.
          </div>
        )}
        {carriers.map((c, i) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: i < carriers.length - 1 ? "1px solid #f3f4f6" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              📦
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              {c.tracking_url_template && (
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{c.tracking_url_template}</div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => handleToggle(c)}
                style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${c.is_active ? "#86efac" : "#e5e7eb"}`, background: c.is_active ? "#f0fdf4" : "#f9fafb", color: c.is_active ? "#16a34a" : "#6b7280", fontSize: 12, cursor: "pointer", fontWeight: 500 }}
              >
                {c.is_active ? "Aktiv" : "Inaktiv"}
              </button>
              <button onClick={() => openEdit(c)} style={{ padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, cursor: "pointer", background: "#fff" }}>Bearbeiten</button>
              <button onClick={() => handleDelete(c.id)} style={{ padding: "5px 12px", border: "1px solid #fee2e2", borderRadius: 6, fontSize: 12, cursor: "pointer", background: "#fff", color: "#ef4444" }}>Löschen</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, width: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{modal.mode === "edit" ? "Carrier bearbeiten" : "Carrier hinzufügen"}</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>×</button>
            </div>
            <div style={{ padding: 24, display: "grid", gap: 14 }}>
              <div><label style={lbl}>Name *</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. DHL" /></div>
              <div><label style={lbl}>Tracking-URL Template <span style={{ color: "#9ca3af" }}>(verwende {"{tracking}"} als Platzhalter)</span></label><input style={inp} value={form.tracking_url_template} onChange={e => setForm(f => ({ ...f, tracking_url_template: e.target.value }))} placeholder="https://carrier.com/track/{tracking}" /></div>
              <div><label style={lbl}>API-Schlüssel <span style={{ color: "#9ca3af" }}>(optional)</span></label><input style={inp} value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} type="password" /></div>
              <div><label style={lbl}>API-Geheimnis <span style={{ color: "#9ca3af" }}>(optional)</span></label><input style={inp} value={form.api_secret} onChange={e => setForm(f => ({ ...f, api_secret: e.target.value }))} type="password" /></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="active" style={{ fontSize: 13, cursor: "pointer" }}>Aktiv</label>
              </div>
            </div>
            {err && <div style={{ margin: "0 24px 12px", color: "#ef4444", fontSize: 12 }}>{err}</div>}
            <div style={{ padding: "12px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ padding: "7px 16px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                {saving ? "…" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
