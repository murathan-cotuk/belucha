"use client";

import React, { useState, useEffect } from "react";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

function fmtCents(c) {
  return (Number(c || 0) / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €";
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE");
}

function CustomerModal({ email, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const client = getMedusaAdminClient();
        const res = await client.getCustomer(email);
        setData(res);
      } catch { }
      setLoading(false);
    })();
  }, [email]);

  const customer = data?.customer;
  const orders = data?.orders || [];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, width: 560, maxHeight: "80vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Kundendetails</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          {loading ? (
            <p style={{ color: "#9ca3af", textAlign: "center" }}>Laden…</p>
          ) : !customer ? (
            <p style={{ color: "#9ca3af" }}>Nicht gefunden</p>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {[customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{customer.email}</div>
                {customer.phone && <div style={{ fontSize: 13, color: "#6b7280" }}>{customer.phone}</div>}
                {customer.country && <div style={{ fontSize: 13, color: "#6b7280" }}>{customer.country}</div>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Bestellungen", value: customer.order_count || 0 },
                  { label: "Gesamtumsatz", value: fmtCents(customer.total_spent) },
                  { label: "Letzter Kauf", value: fmtDate(customer.last_order) },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Bestellhistorie</h3>
              {orders.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9ca3af" }}>Keine Bestellungen</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ textAlign: "left", padding: "4px 0 8px" }}>#</th>
                      <th style={{ textAlign: "left", padding: "4px 0 8px" }}>Status</th>
                      <th style={{ textAlign: "right", padding: "4px 0 8px" }}>Betrag</th>
                      <th style={{ textAlign: "right", padding: "4px 0 8px" }}>Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "8px 0", fontWeight: 600 }}>#{o.order_number}</td>
                        <td style={{ padding: "8px 0" }}>
                          <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: "#f3f4f6", color: "#6b7280" }}>
                            {o.order_status}
                          </span>
                        </td>
                        <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }}>{fmtCents(o.total_cents)}</td>
                        <td style={{ padding: "8px 0", textAlign: "right", color: "#6b7280" }}>{fmtDate(o.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const fetch = async (q) => {
    setLoading(true);
    try {
      const client = getMedusaAdminClient();
      const params = {};
      if (q) params.search = q;
      const data = await client.getCustomers(params);
      setCustomers(data.customers || []);
    } catch { setCustomers([]); }
    setLoading(false);
  };

  useEffect(() => { fetch(""); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    const timeout = setTimeout(() => fetch(val), 400);
    return () => clearTimeout(timeout);
  };

  const COLS = ["Name", "Email", "Land", "Bestellungen", "Gesamtumsatz", "Erster Kauf", "Letzter Kauf"];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Kunden</h1>
        <span style={{ fontSize: 13, color: "#6b7280" }}>{customers.length} Kunden</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Suche nach Name oder Email…"
          value={search}
          onChange={handleSearch}
          style={{ padding: "7px 12px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, width: 300 }}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {COLS.map((c, i) => (
                <th key={i} style={{ padding: "10px 12px", textAlign: i >= 3 ? "center" : "left", fontWeight: 600, fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Laden…</td></tr>
            )}
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "60px 20px", textAlign: "center", color: "#9ca3af" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                  <div>Keine Kunden gefunden</div>
                </td>
              </tr>
            )}
            {customers.map((c, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                onClick={() => setSelected(c.email)}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                  {[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}
                </td>
                <td style={{ padding: "10px 12px", color: "#6b7280" }}>{c.email}</td>
                <td style={{ padding: "10px 12px", color: "#6b7280" }}>{c.country || "—"}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600 }}>{c.order_count || 0}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600 }}>{fmtCents(c.total_spent)}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", fontSize: 12, color: "#6b7280" }}>{fmtDate(c.first_order)}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", fontSize: 12, color: "#6b7280" }}>{fmtDate(c.last_order)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <CustomerModal email={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
