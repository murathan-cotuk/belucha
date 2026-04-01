"use client";

import React, { useState, useEffect } from "react";
import {
  Page, Layout, Card, Text, BlockStack, InlineStack,
  Button, Badge, Banner, Divider, Box, TextField, Modal, Checkbox,
} from "@shopify/polaris";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

// All available menu routes with labels
const ALL_PERMISSIONS = [
  { group: "Genel", items: [
    { key: "/dashboard", label: "Dashboard" },
    { key: "/inbox", label: "Posteingang / Nachrichten" },
  ]},
  { group: "Bestellungen", items: [
    { key: "/orders", label: "Bestellungen (Ansicht)" },
    { key: "/orders/returns", label: "Retouren" },
    { key: "/orders/abandoned-checkouts", label: "Abgebrochene Checkouts", superuserOnly: true },
  ]},
  { group: "Produkte", items: [
    { key: "/products", label: "Produkte" },
    { key: "/products/inventory", label: "Inventar" },
    { key: "/products/collections", label: "Kollektionen", superuserOnly: true },
    { key: "/products/gift-cards", label: "Geschenkkarten" },
  ]},
  { group: "Kunden", items: [
    { key: "/customers", label: "Kundenliste" },
    { key: "/customers/reviews", label: "Bewertungen" },
  ]},
  { group: "Marketing & Rabatte", items: [
    { key: "/marketing", label: "Marketing" },
    { key: "/discounts", label: "Rabatte" },
  ]},
  { group: "Content", items: [
    { key: "/content/media", label: "Medien" },
    { key: "/content/menus", label: "Menüs", superuserOnly: true },
    { key: "/content/categories", label: "Kategorien", superuserOnly: true },
    { key: "/content/landing-page", label: "Landing Page", superuserOnly: true },
    { key: "/content/styles", label: "Styles", superuserOnly: true },
    { key: "/content/pages", label: "Seiten", superuserOnly: true },
    { key: "/content/blog-posts", label: "Blog-Beiträge", superuserOnly: true },
    { key: "/content/brands", label: "Marken" },
    { key: "/content/metaobjects", label: "Metaobjekte" },
  ]},
  { group: "Analytics", items: [
    { key: "/analytics/reports", label: "Berichte" },
    { key: "/analytics/transactions", label: "Transaktionen" },
    { key: "/analytics/live-view", label: "Live-Ansicht", superuserOnly: true },
  ]},
  { group: "Einstellungen", items: [
    { key: "/settings", label: "Einstellungen (allgemein)" },
    { key: "/settings/payments", label: "Zahlungen & IBAN" },
    { key: "/settings/users-permissions", label: "Benutzer & Rechte" },
  ]},
];

const DEFAULT_SELLER_PERMS = [
  "/dashboard", "/inbox", "/orders", "/orders/returns", "/products", "/products/inventory",
  "/products/gift-cards", "/customers", "/customers/reviews", "/marketing", "/discounts",
  "/content/media", "/content/brands", "/content/metaobjects",
  "/analytics/reports", "/analytics/transactions", "/settings", "/settings/payments",
];

function PermissionsSelector({ value, onChange, isSuperuserTarget }) {
  const allowed = value || DEFAULT_SELLER_PERMS;
  const toggle = (key) => {
    if (allowed.includes(key)) onChange(allowed.filter((k) => k !== key));
    else onChange([...allowed, key]);
  };
  const toggleGroup = (items) => {
    const keys = items.map((i) => i.key);
    const allOn = keys.every((k) => allowed.includes(k));
    if (allOn) onChange(allowed.filter((k) => !keys.includes(k)));
    else onChange([...new Set([...allowed, ...keys])]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {ALL_PERMISSIONS.map((group) => {
        const visibleItems = isSuperuserTarget ? group.items : group.items.filter((i) => !i.superuserOnly);
        if (!visibleItems.length) return null;
        const allOn = visibleItems.every((i) => allowed.includes(i.key));
        return (
          <div key={group.group}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Checkbox
                label={<span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{group.group}</span>}
                checked={allOn}
                onChange={() => toggleGroup(visibleItems)}
              />
            </div>
            <div style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 4 }}>
              {visibleItems.map((item) => (
                <Checkbox
                  key={item.key}
                  label={<span style={{ fontSize: 13, color: "#4b5563" }}>{item.label}</span>}
                  checked={allowed.includes(item.key)}
                  onChange={() => toggle(item.key)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    store_name: user?.store_name || "",
    email: user?.email || "",
    password: "",
    is_superuser: user?.is_superuser || false,
    permissions: user?.permissions || DEFAULT_SELLER_PERMS,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!isEdit && (!form.email.trim() || !form.password.trim())) {
      setErr("E-Mail und Passwort sind Pflichtfelder"); return;
    }
    setSaving(true); setErr("");
    try {
      const data = {
        store_name: form.store_name,
        is_superuser: form.is_superuser,
        permissions: form.is_superuser ? null : form.permissions,
      };
      if (isEdit) {
        if (form.password) data.password = form.password;
        await getMedusaAdminClient().updateSellerUser(user.id, data);
      } else {
        data.email = form.email.trim().toLowerCase();
        data.password = form.password;
        await getMedusaAdminClient().createSellerUser(data);
      }
      onSaved();
    } catch (e) {
      setErr(e?.message || "Fehler");
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Benutzer bearbeiten — ${user.email}` : "Neuen Benutzer erstellen"}
      primaryAction={{ content: isEdit ? "Speichern" : "Erstellen", onAction: handleSave, loading: saving }}
      secondaryActions={[{ content: "Abbrechen", onAction: onClose }]}
      large
    >
      <Modal.Section>
        <BlockStack gap="400">
          {err && <Banner tone="critical" onDismiss={() => setErr("")}><Text>{err}</Text></Banner>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {!isEdit && (
              <TextField label="E-Mail *" type="email" value={form.email}
                onChange={(v) => set("email", v)} autoComplete="off" />
            )}
            <TextField label="Shop-/Store-Name" value={form.store_name}
              onChange={(v) => set("store_name", v)} autoComplete="off" />
            <TextField label={isEdit ? "Neues Passwort (leer = nicht ändern)" : "Passwort *"}
              type="password" value={form.password}
              onChange={(v) => set("password", v)} autoComplete="new-password"
              helpText={isEdit ? "Leer lassen um nicht zu ändern" : "Mindestens 6 Zeichen"} />
          </div>
          <Checkbox
            label="Superuser (voller Zugriff, keine Beschränkungen)"
            checked={form.is_superuser}
            onChange={(v) => set("is_superuser", v)}
          />
          {!form.is_superuser && (
            <div>
              <Text variant="headingSm" as="h3">Zugriffsrechte</Text>
              <Box paddingBlockStart="300">
                <PermissionsSelector
                  value={form.permissions}
                  onChange={(v) => set("permissions", v)}
                  isSuperuserTarget={form.is_superuser}
                />
              </Box>
            </div>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export default function UsersPermissionsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [editUser, setEditUser] = useState(null); // null = closed, {} = new, {id,...} = edit
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const su = typeof window !== "undefined" && localStorage.getItem("sellerIsSuperuser") === "true";
    setIsSuperuser(su);
    if (su) fetchUsers();
    else setLoading(false);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedusaAdminClient().getSellerUsers();
      setUsers(data?.users || []);
    } catch (err) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    const myEmail = typeof window !== "undefined" ? localStorage.getItem("sellerEmail") : "";
    if (user.email === myEmail) { alert("Sie können Ihr eigenes Konto nicht löschen."); return; }
    if (!confirm(`Benutzer "${user.email}" wirklich löschen?`)) return;
    setDeleting(user.id);
    try {
      await getMedusaAdminClient().deleteSellerUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      alert(e?.message || "Fehler beim Löschen");
    } finally {
      setDeleting(null);
    }
  };

  if (!isSuperuser) {
    return (
      <Page title="Benutzer & Berechtigungen">
        <Layout>
          <Layout.Section>
            <Card>
              <Banner tone="warning">
                <Text>Nur Superuser können Benutzer verwalten.</Text>
              </Banner>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Benutzer & Berechtigungen"
      primaryAction={{ content: "Neuer Benutzer", onAction: () => setEditUser({}) }}
    >
      <Layout>
        <Layout.Section>
          {error && <Banner tone="critical" onDismiss={() => setError(null)}><Text>{error}</Text></Banner>}

          <Card padding="0">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="headingMd" as="h2">Seller-Konten ({users.length})</Text>
              <Button onClick={fetchUsers} loading={loading} size="slim">Aktualisieren</Button>
            </div>
            {loading ? (
              <Box padding="400"><Text tone="subdued">Laden…</Text></Box>
            ) : users.length === 0 ? (
              <Box padding="400"><Text tone="subdued">Noch keine Benutzer registriert.</Text></Box>
            ) : (
              users.map((user, i) => {
                const perms = user.permissions;
                return (
                  <div
                    key={user.id}
                    style={{
                      padding: "14px 20px",
                      borderBottom: i < users.length - 1 ? "1px solid #f9fafb" : "none",
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 16,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <InlineStack gap="200" blockAlign="center">
                        <Text variant="bodyMd" fontWeight="semibold">{user.store_name || "—"}</Text>
                        {user.is_superuser
                          ? <Badge tone="attention">Superuser</Badge>
                          : <Badge tone="info">Seller</Badge>
                        }
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">{user.email}</Text>
                      {!user.is_superuser && perms && (
                        <Text variant="bodySm" tone="subdued">{perms.length} Zugriffsrechte</Text>
                      )}
                      {!user.is_superuser && !perms && (
                        <Text variant="bodySm" tone="subdued">Standard-Seller-Berechtigungen</Text>
                      )}
                      <Text variant="bodySm" tone="subdued" as="span" style={{ fontSize: 11 }}>
                        Erstellt: {new Date(user.created_at).toLocaleDateString("de-DE")}
                      </Text>
                    </div>
                    <InlineStack gap="200">
                      <Button size="slim" onClick={() => setEditUser(user)}>Bearbeiten</Button>
                      <Button
                        size="slim"
                        tone="critical"
                        variant="secondary"
                        onClick={() => handleDelete(user)}
                        loading={deleting === user.id}
                      >
                        Löschen
                      </Button>
                    </InlineStack>
                  </div>
                );
              })
            )}
          </Card>
        </Layout.Section>
      </Layout>

      {editUser !== null && (
        <UserModal
          user={editUser?.id ? editUser : null}
          onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); fetchUsers(); }}
        />
      )}
    </Page>
  );
}
