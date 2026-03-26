"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  TextField,
  Select,
  Divider,
  Banner,
  Badge,
  Box,
  InlineGrid,
} from "@shopify/polaris";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

/* ── World countries ─────────────────────────────────────────── */
const ALL_COUNTRIES = [
  { code: "AF", label: "Afghanistan" }, { code: "AL", label: "Albanien" }, { code: "DZ", label: "Algerien" },
  { code: "AD", label: "Andorra" }, { code: "AO", label: "Angola" }, { code: "AG", label: "Antigua und Barbuda" },
  { code: "AR", label: "Argentinien" }, { code: "AM", label: "Armenien" }, { code: "AU", label: "Australien" },
  { code: "AT", label: "Österreich" }, { code: "AZ", label: "Aserbaidschan" }, { code: "BS", label: "Bahamas" },
  { code: "BH", label: "Bahrain" }, { code: "BD", label: "Bangladesch" }, { code: "BB", label: "Barbados" },
  { code: "BY", label: "Belarus" }, { code: "BE", label: "Belgien" }, { code: "BZ", label: "Belize" },
  { code: "BJ", label: "Benin" }, { code: "BT", label: "Bhutan" }, { code: "BO", label: "Bolivien" },
  { code: "BA", label: "Bosnien und Herzegowina" }, { code: "BW", label: "Botswana" }, { code: "BR", label: "Brasilien" },
  { code: "BN", label: "Brunei" }, { code: "BG", label: "Bulgarien" }, { code: "BF", label: "Burkina Faso" },
  { code: "BI", label: "Burundi" }, { code: "CV", label: "Cabo Verde" }, { code: "KH", label: "Kambodscha" },
  { code: "CM", label: "Kamerun" }, { code: "CA", label: "Kanada" }, { code: "CF", label: "Zentralafrikanische Republik" },
  { code: "TD", label: "Tschad" }, { code: "CL", label: "Chile" }, { code: "CN", label: "China" },
  { code: "CO", label: "Kolumbien" }, { code: "KM", label: "Komoren" }, { code: "CG", label: "Kongo" },
  { code: "CD", label: "DR Kongo" }, { code: "CR", label: "Costa Rica" }, { code: "HR", label: "Kroatien" },
  { code: "CU", label: "Kuba" }, { code: "CY", label: "Zypern" }, { code: "CZ", label: "Tschechien" },
  { code: "DK", label: "Dänemark" }, { code: "DJ", label: "Dschibuti" }, { code: "DM", label: "Dominica" },
  { code: "DO", label: "Dominikanische Republik" }, { code: "EC", label: "Ecuador" }, { code: "EG", label: "Ägypten" },
  { code: "SV", label: "El Salvador" }, { code: "GQ", label: "Äquatorialguinea" }, { code: "ER", label: "Eritrea" },
  { code: "EE", label: "Estland" }, { code: "SZ", label: "Eswatini" }, { code: "ET", label: "Äthiopien" },
  { code: "FJ", label: "Fidschi" }, { code: "FI", label: "Finnland" }, { code: "FR", label: "Frankreich" },
  { code: "GA", label: "Gabun" }, { code: "GM", label: "Gambia" }, { code: "GE", label: "Georgien" },
  { code: "DE", label: "Deutschland" }, { code: "GH", label: "Ghana" }, { code: "GR", label: "Griechenland" },
  { code: "GD", label: "Grenada" }, { code: "GT", label: "Guatemala" }, { code: "GN", label: "Guinea" },
  { code: "GW", label: "Guinea-Bissau" }, { code: "GY", label: "Guyana" }, { code: "HT", label: "Haiti" },
  { code: "HN", label: "Honduras" }, { code: "HU", label: "Ungarn" }, { code: "IS", label: "Island" },
  { code: "IN", label: "Indien" }, { code: "ID", label: "Indonesien" }, { code: "IR", label: "Iran" },
  { code: "IQ", label: "Irak" }, { code: "IE", label: "Irland" }, { code: "IL", label: "Israel" },
  { code: "IT", label: "Italien" }, { code: "JM", label: "Jamaika" }, { code: "JP", label: "Japan" },
  { code: "JO", label: "Jordanien" }, { code: "KZ", label: "Kasachstan" }, { code: "KE", label: "Kenia" },
  { code: "KI", label: "Kiribati" }, { code: "KP", label: "Nordkorea" }, { code: "KR", label: "Südkorea" },
  { code: "KW", label: "Kuwait" }, { code: "KG", label: "Kirgisistan" }, { code: "LA", label: "Laos" },
  { code: "LV", label: "Lettland" }, { code: "LB", label: "Libanon" }, { code: "LS", label: "Lesotho" },
  { code: "LR", label: "Liberia" }, { code: "LY", label: "Libyen" }, { code: "LI", label: "Liechtenstein" },
  { code: "LT", label: "Litauen" }, { code: "LU", label: "Luxemburg" }, { code: "MG", label: "Madagaskar" },
  { code: "MW", label: "Malawi" }, { code: "MY", label: "Malaysia" }, { code: "MV", label: "Malediven" },
  { code: "ML", label: "Mali" }, { code: "MT", label: "Malta" }, { code: "MH", label: "Marshallinseln" },
  { code: "MR", label: "Mauretanien" }, { code: "MU", label: "Mauritius" }, { code: "MX", label: "Mexiko" },
  { code: "FM", label: "Mikronesien" }, { code: "MD", label: "Moldau" }, { code: "MC", label: "Monaco" },
  { code: "MN", label: "Mongolei" }, { code: "ME", label: "Montenegro" }, { code: "MA", label: "Marokko" },
  { code: "MZ", label: "Mosambik" }, { code: "MM", label: "Myanmar" }, { code: "NA", label: "Namibia" },
  { code: "NR", label: "Nauru" }, { code: "NP", label: "Nepal" }, { code: "NL", label: "Niederlande" },
  { code: "NZ", label: "Neuseeland" }, { code: "NI", label: "Nicaragua" }, { code: "NE", label: "Niger" },
  { code: "NG", label: "Nigeria" }, { code: "MK", label: "Nordmazedonien" }, { code: "NO", label: "Norwegen" },
  { code: "OM", label: "Oman" }, { code: "PK", label: "Pakistan" }, { code: "PW", label: "Palau" },
  { code: "PA", label: "Panama" }, { code: "PG", label: "Papua-Neuguinea" }, { code: "PY", label: "Paraguay" },
  { code: "PE", label: "Peru" }, { code: "PH", label: "Philippinen" }, { code: "PL", label: "Polen" },
  { code: "PT", label: "Portugal" }, { code: "QA", label: "Katar" }, { code: "RO", label: "Rumänien" },
  { code: "RU", label: "Russland" }, { code: "RW", label: "Ruanda" }, { code: "KN", label: "St. Kitts und Nevis" },
  { code: "LC", label: "St. Lucia" }, { code: "VC", label: "St. Vincent und die Grenadinen" }, { code: "WS", label: "Samoa" },
  { code: "SM", label: "San Marino" }, { code: "ST", label: "São Tomé und Príncipe" }, { code: "SA", label: "Saudi-Arabien" },
  { code: "SN", label: "Senegal" }, { code: "RS", label: "Serbien" }, { code: "SC", label: "Seychellen" },
  { code: "SL", label: "Sierra Leone" }, { code: "SG", label: "Singapur" }, { code: "SK", label: "Slowakei" },
  { code: "SI", label: "Slowenien" }, { code: "SB", label: "Salomonen" }, { code: "SO", label: "Somalia" },
  { code: "ZA", label: "Südafrika" }, { code: "SS", label: "Südsudan" }, { code: "ES", label: "Spanien" },
  { code: "LK", label: "Sri Lanka" }, { code: "SD", label: "Sudan" }, { code: "SR", label: "Suriname" },
  { code: "SE", label: "Schweden" }, { code: "CH", label: "Schweiz" }, { code: "SY", label: "Syrien" },
  { code: "TW", label: "Taiwan" }, { code: "TJ", label: "Tadschikistan" }, { code: "TZ", label: "Tansania" },
  { code: "TH", label: "Thailand" }, { code: "TL", label: "Osttimor" }, { code: "TG", label: "Togo" },
  { code: "TO", label: "Tonga" }, { code: "TT", label: "Trinidad und Tobago" }, { code: "TN", label: "Tunesien" },
  { code: "TR", label: "Türkei" }, { code: "TM", label: "Turkmenistan" }, { code: "TV", label: "Tuvalu" },
  { code: "UG", label: "Uganda" }, { code: "UA", label: "Ukraine" }, { code: "AE", label: "Vereinigte Arabische Emirate" },
  { code: "GB", label: "Vereinigtes Königreich" }, { code: "US", label: "USA" }, { code: "UY", label: "Uruguay" },
  { code: "UZ", label: "Usbekistan" }, { code: "VU", label: "Vanuatu" }, { code: "VE", label: "Venezuela" },
  { code: "VN", label: "Vietnam" }, { code: "YE", label: "Jemen" }, { code: "ZM", label: "Sambia" },
  { code: "ZW", label: "Simbabwe" },
].sort((a, b) => a.label.localeCompare(b.label, "de"));

/* ── Country multi-select ────────────────────────────────────── */
function CountryPicker({ selected, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = ALL_COUNTRIES.filter(
    (c) =>
      !selected.includes(c.code) &&
      (c.label.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
  );

  const add = (code) => { onChange([...selected, code]); setSearch(""); };
  const remove = (code) => onChange(selected.filter((c) => c !== code));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        style={{ border: "1px solid #8c9196", borderRadius: 4, padding: "6px 10px", background: "#fff", cursor: "text", minHeight: 36 }}
        onClick={() => setOpen(true)}
      >
        <input
          style={{ border: "none", outline: "none", width: "100%", fontSize: 13, background: "transparent", color: "#202223" }}
          placeholder={selected.length === 0 ? "Land suchen und auswählen…" : "Weiteres Land hinzufügen…"}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "#fff", border: "1px solid #c9cccf", borderRadius: 4,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", maxHeight: 220, overflowY: "auto", marginTop: 2,
        }}>
          {filtered.slice(0, 60).map((c) => (
            <div
              key={c.code}
              onMouseDown={(e) => { e.preventDefault(); add(c.code); setOpen(false); }}
              style={{ padding: "7px 12px", fontSize: 13, cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f6f6f7"}
              onMouseLeave={(e) => e.currentTarget.style.background = ""}
            >
              <span style={{ fontWeight: 600, color: "#6d7175", minWidth: 28, fontSize: 11 }}>{c.code}</span>
              <span style={{ color: "#202223" }}>{c.label}</span>
            </div>
          ))}
          {filtered.length > 60 && (
            <div style={{ padding: "6px 12px", fontSize: 12, color: "#6d7175", borderTop: "1px solid #f1f1f1" }}>
              … {filtered.length - 60} weitere Ergebnisse. Suche verfeinern.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Shipping groups section ─────────────────────────────────── */
const EMPTY_GROUP_FORM = { name: "", carrier_id: "", selectedCountries: [], prices: {} };

function ShippingGroupsSection({ carriers }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_GROUP_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMedusaAdminClient().request("/admin-hub/v1/shipping-groups");
      setGroups(data?.groups || []);
    } catch (_) { setGroups([]); }
    setLoading(false);
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const openCreate = () => {
    setForm(EMPTY_GROUP_FORM);
    setEditingId(null);
    setErr("");
    setShowForm(true);
  };

  const openEdit = (g) => {
    const selectedCountries = (g.prices || []).filter(p => p.price_cents > 0).map(p => p.country_code);
    const prices = {};
    for (const p of (g.prices || [])) {
      if (p.price_cents > 0) prices[p.country_code] = String(p.price_cents / 100);
    }
    setForm({ name: g.name || "", carrier_id: g.carrier_id || "", selectedCountries, prices });
    setEditingId(g.id);
    setErr("");
    setShowForm(true);
  };

  const handleCountriesChange = (codes) => {
    setForm((f) => {
      const newPrices = { ...f.prices };
      // Remove prices for deselected countries
      for (const k of Object.keys(newPrices)) {
        if (!codes.includes(k)) delete newPrices[k];
      }
      return { ...f, selectedCountries: codes, prices: newPrices };
    });
  };

  const handleSave = async () => {
    if (!form.name) { setErr("Gruppenname ist erforderlich"); return; }
    setSaving(true); setErr("");
    try {
      const client = getMedusaAdminClient();
      const pricesPayload = form.selectedCountries.map((code) => ({
        country_code: code,
        price_cents: Math.round(Number(String(form.prices[code] || "0").replace(",", ".")) * 100) || 0,
      }));
      if (editingId) {
        await client.request(`/admin-hub/v1/shipping-groups/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify({ name: form.name, carrier_id: form.carrier_id || null, prices: pricesPayload }),
        });
      } else {
        await client.request("/admin-hub/v1/shipping-groups", {
          method: "POST",
          body: JSON.stringify({ name: form.name, carrier_id: form.carrier_id || null, prices: pricesPayload }),
        });
      }
      await loadGroups();
      setShowForm(false);
      setEditingId(null);
    } catch (e) { setErr(e?.message || "Fehler beim Speichern"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Versandgruppe löschen?")) return;
    try {
      await getMedusaAdminClient().request(`/admin-hub/v1/shipping-groups/${id}`, { method: "DELETE" });
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (_) {}
  };

  const carrierOptions = [
    { label: "— Kein Carrier —", value: "" },
    ...carriers.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <BlockStack gap="400">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BlockStack gap="100">
          <Text variant="headingMd" as="h2">Versandgruppen</Text>
          <Text variant="bodySm" tone="subdued">Versandpreise pro Land für Produktgruppen verwalten.</Text>
        </BlockStack>
        <Button onClick={openCreate}>+ Neue Gruppe</Button>
      </div>

      {loading && <Text tone="subdued">Laden…</Text>}

      {!loading && groups.length === 0 && !showForm && (
        <Box padding="600" background="bg-surface-secondary" borderRadius="200">
          <Text alignment="center" tone="subdued">Noch keine Versandgruppen. Erstelle deine erste Gruppe.</Text>
        </Box>
      )}

      {groups.length > 0 && (
        <Card padding="0">
          {groups.map((g, i) => (
            <div key={g.id}>
              {i > 0 && <Divider />}
              <div style={{ padding: "14px 20px" }}>
                <InlineStack align="space-between" blockAlign="start" gap="400">
                  <BlockStack gap="200">
                    <Text variant="bodyMd" fontWeight="semibold">{g.name}</Text>
                    {g.carrier_name && <Text variant="bodySm" tone="subdued">Carrier: {g.carrier_name}</Text>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                      {(g.prices || []).filter(p => p.price_cents > 0).map((p) => {
                        const country = ALL_COUNTRIES.find((c) => c.code === p.country_code);
                        return (
                          <span key={p.country_code} style={{ fontSize: 11, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 8px", color: "#374151" }}>
                            {country?.label || p.country_code}: {(p.price_cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                          </span>
                        );
                      })}
                    </div>
                  </BlockStack>
                  <InlineStack gap="200">
                    <Button size="slim" onClick={() => openEdit(g)}>Bearbeiten</Button>
                    <Button size="slim" tone="critical" onClick={() => handleDelete(g.id)}>Löschen</Button>
                  </InlineStack>
                </InlineStack>
              </div>
            </div>
          ))}
        </Card>
      )}

      {showForm && (
        <Card>
          <BlockStack gap="400">
            <Text variant="headingSm" as="h3">{editingId ? "Versandgruppe bearbeiten" : "Neue Versandgruppe"}</Text>
            <InlineGrid columns={2} gap="400">
              <TextField
                label="Gruppenname"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="z.B. Standart Paket"
                autoComplete="off"
              />
              <Select
                label="Carrier"
                options={carrierOptions}
                value={form.carrier_id}
                onChange={(v) => setForm((f) => ({ ...f, carrier_id: v }))}
              />
            </InlineGrid>

            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="semibold">Lieferländer auswählen</Text>
              <CountryPicker
                selected={form.selectedCountries}
                onChange={handleCountriesChange}
              />
            </BlockStack>

            {form.selectedCountries.length > 0 && (
              <BlockStack gap="200">
                <Text variant="bodySm" fontWeight="semibold">Versandpreise</Text>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                  {form.selectedCountries.map((code, i) => {
                    const country = ALL_COUNTRIES.find((c) => c.code === code);
                    return (
                      <div key={code} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", borderBottom: i < form.selectedCountries.length - 1 ? "1px solid #f3f4f6" : "none", background: "#fff" }}>
                        <span style={{ minWidth: 160, fontSize: 13, color: "#374151" }}>
                          <span style={{ fontWeight: 600, color: "#6d7175", fontSize: 11, marginRight: 6 }}>{code}</span>
                          {country?.label || code}
                        </span>
                        <div style={{ flex: 1, maxWidth: 160 }}>
                          <TextField
                            value={form.prices[code] || ""}
                            onChange={(v) => setForm((f) => ({ ...f, prices: { ...f.prices, [code]: v } }))}
                            placeholder="0.00"
                            suffix="€"
                            autoComplete="off"
                          />
                        </div>
                        <button
                          onClick={() => handleCountriesChange(form.selectedCountries.filter(c => c !== code))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}
                          title="Land entfernen"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </BlockStack>
            )}

            {err && <Banner tone="critical"><p>{err}</p></Banner>}
            <InlineStack gap="200">
              <Button onClick={() => { setShowForm(false); setEditingId(null); }}>Abbrechen</Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>Speichern</Button>
            </InlineStack>
          </BlockStack>
        </Card>
      )}
    </BlockStack>
  );
}

/* ── Carrier modal ───────────────────────────────────────────── */
const EMPTY_CARRIER_FORM = { name: "", tracking_url_template: "", api_key: "", api_secret: "", is_active: true };

function CarrierModal({ mode, carrier, onClose, onSaved }) {
  const [form, setForm] = useState(
    carrier
      ? { name: carrier.name || "", tracking_url_template: carrier.tracking_url_template || "", api_key: carrier.api_key || "", api_secret: carrier.api_secret || "", is_active: carrier.is_active !== false }
      : EMPTY_CARRIER_FORM
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async () => {
    if (!form.name) { setErr("Name ist erforderlich"); return; }
    setSaving(true); setErr("");
    try {
      const client = getMedusaAdminClient();
      const res = mode === "edit"
        ? await client.updateCarrier(carrier.id, form)
        : await client.createCarrier(form);
      onSaved(res.carrier, mode);
      onClose();
    } catch (e) { setErr(e?.message || "Fehler"); }
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text variant="headingMd" as="h3">{mode === "edit" ? "Carrier bearbeiten" : "Carrier hinzufügen"}</Text>
          <Button variant="plain" onClick={onClose}>✕</Button>
        </div>
        <div style={{ padding: 20 }}>
          <BlockStack gap="400">
            <TextField label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="z.B. DHL" autoComplete="off" />
            <TextField
              label={<>Tracking-URL <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 12 }}>({"{tracking}"} als Platzhalter)</span></>}
              value={form.tracking_url_template}
              onChange={(v) => setForm((f) => ({ ...f, tracking_url_template: v }))}
              placeholder="https://carrier.com/track/{tracking}"
              autoComplete="off"
            />
            <TextField label={<>API-Schlüssel <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 12 }}>(optional)</span></>} value={form.api_key} onChange={(v) => setForm((f) => ({ ...f, api_key: v }))} type="password" autoComplete="off" />
            <TextField label={<>API-Geheimnis <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 12 }}>(optional)</span></>} value={form.api_secret} onChange={(v) => setForm((f) => ({ ...f, api_secret: v }))} type="password" autoComplete="off" />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
              Aktiv
            </label>
            {err && <Banner tone="critical"><p>{err}</p></Banner>}
          </BlockStack>
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb" }}>
          <InlineStack gap="200" align="end">
            <Button onClick={onClose}>Abbrechen</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Speichern</Button>
          </InlineStack>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
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

export default function ShippingSettingsPage() {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getMedusaAdminClient().getCarriers();
    setCarriers(data.carriers || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCarrierSaved = (carrier, mode) => {
    if (mode === "edit") {
      setCarriers((prev) => prev.map((c) => (c.id === carrier?.id ? { ...c, ...carrier } : c)));
    } else {
      if (carrier) setCarriers((prev) => [...prev, carrier]);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Carrier löschen?")) return;
    await getMedusaAdminClient().deleteCarrier(id);
    setCarriers((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggle = async (c) => {
    await getMedusaAdminClient().updateCarrier(c.id, { is_active: !c.is_active });
    setCarriers((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)));
  };

  const getModalCarrier = () => {
    if (!modal) return null;
    if (modal.mode === "edit") return modal.carrier;
    if (modal.preset) return { ...EMPTY_CARRIER_FORM, name: modal.preset.name, tracking_url_template: modal.preset.tracking_url_template };
    return null;
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <BlockStack gap="600">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <BlockStack gap="100">
            <Text variant="headingLg" as="h1">Versand & Lieferung</Text>
            <Text variant="bodySm" tone="subdued">Versanddienstleister verwalten und Tracking-URLs konfigurieren.</Text>
          </BlockStack>
          <Button variant="primary" onClick={() => setModal({ mode: "create" })}>+ Carrier hinzufügen</Button>
        </div>

        <Card>
          <BlockStack gap="300">
            <Text variant="bodySm" tone="subdued" fontWeight="semibold">Schnellstart — Vorkonfigurierte Carrier</Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESET_CARRIERS.map((p) => (
                <Button key={p.name} size="slim" onClick={() => setModal({ mode: "create", preset: p })}>+ {p.name}</Button>
              ))}
            </div>
          </BlockStack>
        </Card>

        <Card padding="0">
          {loading && <Box padding="800"><Text alignment="center" tone="subdued">Laden…</Text></Box>}
          {!loading && carriers.length === 0 && (
            <Box padding="800"><Text alignment="center" tone="subdued">Noch keine Carrier konfiguriert.</Text></Box>
          )}
          {carriers.map((c, i) => (
            <div key={c.id}>
              {i > 0 && <Divider />}
              <div style={{ padding: "14px 20px" }}>
                <InlineStack align="space-between" blockAlign="center" gap="400">
                  <InlineStack gap="300" blockAlign="center">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      📦
                    </div>
                    <BlockStack gap="050">
                      <Text variant="bodyMd" fontWeight="semibold">{c.name}</Text>
                      {c.tracking_url_template && <Text variant="bodySm" tone="subdued">{c.tracking_url_template}</Text>}
                    </BlockStack>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone={c.is_active ? "success" : undefined}>{c.is_active ? "Aktiv" : "Inaktiv"}</Badge>
                    <Button size="slim" onClick={() => handleToggle(c)}>{c.is_active ? "Deaktivieren" : "Aktivieren"}</Button>
                    <Button size="slim" onClick={() => setModal({ mode: "edit", carrier: c })}>Bearbeiten</Button>
                    <Button size="slim" tone="critical" onClick={() => handleDelete(c.id)}>Löschen</Button>
                  </InlineStack>
                </InlineStack>
              </div>
            </div>
          ))}
        </Card>

        <Divider />
        <ShippingGroupsSection carriers={carriers} />
      </BlockStack>

      {modal && (
        <CarrierModal
          mode={modal.mode}
          carrier={getModalCarrier()}
          onClose={() => setModal(null)}
          onSaved={handleCarrierSaved}
        />
      )}
    </div>
  );
}
