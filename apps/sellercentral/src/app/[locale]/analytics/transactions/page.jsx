"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  Banner,
  Divider,
  Box,
  Select,
  Modal,
  TextField,
} from "@shopify/polaris";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

const fmt = (cents, currency = "EUR") =>
  (cents / 100).toLocaleString("de-DE", { style: "currency", currency });

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("de-DE") : "—";

function SummaryCard({ seller }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
      padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{seller.store_name}</div>
      <div style={{ fontSize: 11, color: "#6b7280" }}>ID: {seller.seller_id}</div>
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 4 }}>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Umsatz</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{fmt(seller.total_cents)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Provision (10%)</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>{fmt(seller.commission_cents)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Auszahlung</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>{fmt(seller.payout_cents)}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{seller.order_count} Bestellungen</div>
    </div>
  );
}

function PayoutModal({ seller, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const periodStart = new Date();
  periodStart.setDate(1);
  const [form, setForm] = useState({
    period_start: periodStart.toISOString().split("T")[0],
    period_end: today,
    notes: "",
  });

  const handleCreate = async () => {
    setSaving(true);
    setErr("");
    try {
      await getMedusaAdminClient().createPayout({
        seller_id: seller.seller_id,
        period_start: form.period_start,
        period_end: form.period_end,
        total_cents: seller.total_cents,
        commission_cents: seller.commission_cents,
        payout_cents: seller.payout_cents,
        iban: seller.iban || null,
        notes: form.notes,
      });
      onCreated();
    } catch (e) {
      setErr(e?.message || "Fehler");
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Auszahlung erstellen — ${seller.store_name}`}
      primaryAction={{ content: "Erstellen", onAction: handleCreate, loading: saving }}
      secondaryActions={[{ content: "Abbrechen", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {err && <Banner tone="critical"><Text>{err}</Text></Banner>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextField label="Zeitraum von" type="date" value={form.period_start}
              onChange={(v) => setForm((f) => ({ ...f, period_start: v }))} autoComplete="off" />
            <TextField label="Zeitraum bis" type="date" value={form.period_end}
              onChange={(v) => setForm((f) => ({ ...f, period_end: v }))} autoComplete="off" />
          </div>
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px", fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#6b7280" }}>Umsatz</span>
              <span style={{ fontWeight: 600 }}>{fmt(seller.total_cents)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#6b7280" }}>Provision (10%)</span>
              <span style={{ fontWeight: 600, color: "#ef4444" }}>− {fmt(seller.commission_cents)}</span>
            </div>
            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontWeight: 700 }}>Auszahlung</span>
              <span style={{ fontWeight: 700, color: "#10b981" }}>{fmt(seller.payout_cents)}</span>
            </div>
            {seller.iban && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>IBAN: {seller.iban}</div>
            )}
          </div>
          <TextField label="Notizen (optional)" value={form.notes}
            onChange={(v) => setForm((f) => ({ ...f, notes: v }))} multiline={2} autoComplete="off" />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [filterSeller, setFilterSeller] = useState("");
  const [payoutModal, setPayoutModal] = useState(null);
  const [tab, setTab] = useState("transactions"); // 'transactions' | 'payouts'

  useEffect(() => {
    const su = typeof window !== "undefined" && localStorage.getItem("sellerIsSuperuser") === "true";
    setIsSuperuser(su);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const params = {};
      if (filterSeller) params.seller_id = filterSeller;
      const [txRes, poRes] = await Promise.all([
        getMedusaAdminClient().getTransactions(params),
        getMedusaAdminClient().getPayouts(params),
      ]);
      setTransactions(txRes?.transactions || []);
      setSummary(txRes?.summary || []);
      setPayouts(poRes?.payouts || []);
    } catch (e) {
      setErr(e?.message || "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [filterSeller]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sellerOptions = [
    { label: "Alle Seller", value: "" },
    ...summary.map((s) => ({ label: s.store_name, value: s.seller_id })),
  ];

  const payoutStatusTone = (status) => {
    if (status === "bezahlt") return "success";
    if (status === "offen") return "warning";
    return "info";
  };

  const markPaid = async (payout) => {
    try {
      await getMedusaAdminClient().updatePayout(payout.id, { status: "bezahlt" });
      fetchData();
    } catch (e) {
      alert(e?.message || "Fehler");
    }
  };

  return (
    <Page
      title="Transaktionen"
      subtitle="Bestellungen, die für Auszahlung freigegeben sind (14+ Tage nach Lieferung)"
    >
      <Layout>
        {/* Summary cards */}
        {isSuperuser && summary.length > 0 && (
          <Layout.Section>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {summary.map((s) => <SummaryCard key={s.seller_id} seller={s} />)}
            </div>
          </Layout.Section>
        )}

        {/* Own summary for non-superuser */}
        {!isSuperuser && summary.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">Ihre Übersicht</Text>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <Text tone="subdued" variant="bodySm">Gesamtumsatz</Text>
                    <Text variant="headingLg" fontWeight="bold">{fmt(summary[0]?.total_cents || 0)}</Text>
                  </div>
                  <div>
                    <Text tone="subdued" variant="bodySm">Provision (10%)</Text>
                    <Text variant="headingLg" fontWeight="bold" tone="critical">{fmt(summary[0]?.commission_cents || 0)}</Text>
                  </div>
                  <div>
                    <Text tone="subdued" variant="bodySm">Auszahlung</Text>
                    <Text variant="headingLg" fontWeight="bold" tone="success">{fmt(summary[0]?.payout_cents || 0)}</Text>
                  </div>
                </div>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        <Layout.Section>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
            {[["transactions", "Transaktionen"], ["payouts", "Auszahlungen"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "8px 20px", fontSize: 13, fontWeight: 600, border: "1px solid #e5e7eb",
                  background: tab === key ? "#111827" : "#fff",
                  color: tab === key ? "#fff" : "#374151",
                  cursor: "pointer",
                  borderRadius: key === "transactions" ? "8px 0 0 8px" : "0 8px 8px 0",
                  marginRight: -1,
                }}
              >{label}</button>
            ))}
            {isSuperuser && summary.length > 0 && tab === "transactions" && (
              <div style={{ marginLeft: "auto" }}>
                <Select
                  options={sellerOptions}
                  value={filterSeller}
                  onChange={setFilterSeller}
                  label=""
                />
              </div>
            )}
          </div>

          {err && <Banner tone="critical" onDismiss={() => setErr("")}><Text>{err}</Text></Banner>}

          {tab === "transactions" && (
            <Card padding="0">
              {loading ? (
                <Box padding="600" textAlign="center"><Text tone="subdued">Laden…</Text></Box>
              ) : transactions.length === 0 ? (
                <Box padding="600" textAlign="center">
                  <Text tone="subdued">Keine freigegebenen Transaktionen vorhanden.</Text>
                  <Box paddingBlockStart="200">
                    <Text tone="subdued" variant="bodySm">Nur Bestellungen, die mindestens 14 Tage nach Lieferung vergangen sind, werden hier angezeigt.</Text>
                  </Box>
                </Box>
              ) : (
                <div>
                  {/* Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 110px 110px 110px 110px", gap: 8, padding: "10px 16px", borderBottom: "1px solid #f3f4f6", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                    <div>Bestellung</div>
                    {isSuperuser && <div>Seller</div>}
                    <div style={{ textAlign: "right" }}>Umsatz</div>
                    <div style={{ textAlign: "right" }}>Provision</div>
                    <div style={{ textAlign: "right" }}>Auszahlung</div>
                    <div style={{ textAlign: "right" }}>Lieferdatum</div>
                  </div>
                  {transactions.map((tx) => (
                    <div key={tx.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 110px 110px 110px 110px", gap: 8, padding: "10px 16px", borderBottom: "1px solid #f9fafb", fontSize: 13, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827" }}>#{tx.order_number}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{tx.first_name} {tx.last_name}</div>
                      </div>
                      {isSuperuser && <div style={{ fontSize: 12, color: "#6b7280" }}>{tx.store_name}</div>}
                      <div style={{ textAlign: "right", fontWeight: 500 }}>{fmt(tx.total_cents, tx.currency)}</div>
                      <div style={{ textAlign: "right", color: "#ef4444" }}>−{fmt(tx.commission_cents, tx.currency)}</div>
                      <div style={{ textAlign: "right", color: "#10b981", fontWeight: 600 }}>{fmt(tx.payout_cents, tx.currency)}</div>
                      <div style={{ textAlign: "right", color: "#6b7280" }}>{fmtDate(tx.delivery_date)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === "payouts" && (
            <Card padding="0">
              {isSuperuser && summary.length > 0 && (
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {summary.map((s) => (
                    <Button key={s.seller_id} size="slim" onClick={() => setPayoutModal(s)}>
                      Auszahlung für {s.store_name}
                    </Button>
                  ))}
                </div>
              )}
              {payouts.length === 0 ? (
                <Box padding="600" textAlign="center"><Text tone="subdued">Noch keine Auszahlungen erstellt.</Text></Box>
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 110px 110px 80px 100px", gap: 8, padding: "10px 16px", borderBottom: "1px solid #f3f4f6", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                    <div>Zeitraum</div>
                    {isSuperuser ? <div>Seller</div> : <div>IBAN</div>}
                    <div style={{ textAlign: "right" }}>Umsatz</div>
                    <div style={{ textAlign: "right" }}>Auszahlung</div>
                    <div style={{ textAlign: "center" }}>Status</div>
                    {isSuperuser && <div style={{ textAlign: "right" }}>Aktion</div>}
                  </div>
                  {payouts.map((p) => (
                    <div key={p.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr 110px 110px 80px 100px", gap: 8, padding: "10px 16px", borderBottom: "1px solid #f9fafb", fontSize: 13, alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: "#374151" }}>
                        {fmtDate(p.period_start)}<br />– {fmtDate(p.period_end)}
                      </div>
                      {isSuperuser ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{p.store_name || p.seller_id}</div>
                          {p.iban && <div style={{ fontSize: 11, color: "#6b7280" }}>{p.iban}</div>}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{p.iban || "—"}</div>
                      )}
                      <div style={{ textAlign: "right" }}>{fmt(p.total_cents)}</div>
                      <div style={{ textAlign: "right", fontWeight: 600, color: "#10b981" }}>{fmt(p.payout_cents)}</div>
                      <div style={{ textAlign: "center" }}>
                        <Badge tone={payoutStatusTone(p.status)}>{p.status}</Badge>
                      </div>
                      {isSuperuser && (
                        <div style={{ textAlign: "right" }}>
                          {p.status !== "bezahlt" && (
                            <Button size="slim" variant="primary" onClick={() => markPaid(p)}>Bezahlt</Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </Layout.Section>
      </Layout>

      {payoutModal && (
        <PayoutModal
          seller={payoutModal}
          onClose={() => setPayoutModal(null)}
          onCreated={() => { setPayoutModal(null); fetchData(); }}
        />
      )}
    </Page>
  );
}

export default function TransactionsPageWrapper() {
  return <DashboardLayout><TransactionsPage /></DashboardLayout>;
}
