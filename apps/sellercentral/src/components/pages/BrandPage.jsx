"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Page,
  Card,
  Button,
  TextField,
  Text,
  BlockStack,
  InlineStack,
  Banner,
  Box,
  Modal,
  DropZone,
  Thumbnail,
} from "@shopify/polaris";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";
import { titleToHandle } from "@/lib/slugify";

const getDefaultBaseUrl = () => (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "").replace(/\/$/, "") || (typeof window !== "undefined" ? "http://localhost:9000" : "");

export default function BrandPage() {
  const client = getMedusaAdminClient();
  const baseUrl = (client.baseURL || getDefaultBaseUrl()).replace(/\/$/, "");
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaLibraryList, setMediaLibraryList] = useState([]);
  const [formData, setFormData] = useState({ name: "", handle: "", logo_image: "", address: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const loadBrands = () => {
    setLoading(true);
    client.getBrands().then((r) => {
      setBrands(r.brands || []);
      setLoading(false);
    }).catch(() => {
      setBrands([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleSubmit = async () => {
    const name = (formData.name || "").trim();
    if (!name) {
      setMessage({ type: "error", text: "Brand name is required." });
      return;
    }
    const handle = (formData.handle || "").trim() || titleToHandle(name) || "brand-" + Date.now();
    setCreating(true);
    setMessage({ type: "", text: "" });
    try {
      await client.createBrand({
        name,
        handle,
        logo_image: (formData.logo_image || "").trim() || undefined,
        address: (formData.address || "").trim() || undefined,
      });
      setMessage({ type: "success", text: "Brand created." });
      setFormData({ name: "", handle: "", logo_image: "", address: "" });
      setSlugManuallyEdited(false);
      setModalOpen(false);
      loadBrands();
    } catch (e) {
      setMessage({ type: "error", text: e?.message || "Failed to create brand." });
    } finally {
      setCreating(false);
    }
  };

  const handleLogoDrop = (files) => {
    const file = Array.isArray(files) ? files[0] : files;
    if (!file) return;
    setLogoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    client.uploadMedia(fd).then((r) => {
      const url = r?.url ? (r.url.startsWith("http") ? r.url : `${baseUrl}${r.url}`) : null;
      if (url) setFormData((p) => ({ ...p, logo_image: url }));
    }).catch(() => setMessage({ type: "error", text: "Logo upload failed." })).finally(() => setLogoUploading(false));
  };
  const openMediaPicker = () => {
    setMediaPickerOpen(true);
    client.getMedia({ limit: 100 }).then((r) => setMediaLibraryList(r.media || [])).catch(() => setMediaLibraryList([]));
  };
  const pickLogo = (url) => {
    if (url) setFormData((p) => ({ ...p, logo_image: url.startsWith("http") ? url : `${baseUrl}${url}` }));
    setMediaPickerOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this brand?")) return;
    try {
      await client.deleteBrand(id);
      setMessage({ type: "success", text: "Brand deleted." });
      loadBrands();
    } catch (e) {
      setMessage({ type: "error", text: e?.message || "Failed to delete." });
    }
  };

  return (
    <Page
      title="Brands"
      primaryAction={{
        content: "Add Brand",
        onAction: () => setModalOpen(true),
      }}
    >
      <BlockStack gap="400">
        {message.text && (
          <Banner
            tone={message.type === "success" ? "success" : message.type === "error" ? "critical" : "info"}
            onDismiss={() => setMessage({ type: "", text: "" })}
          >
            {message.text}
          </Banner>
        )}

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Your brands (product form uses this list only)
            </Text>

            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Add Brand"
              primaryAction={{
                content: "Create",
                onAction: handleSubmit,
                loading: creating,
              }}
              secondaryActions={[{ content: "Cancel", onAction: () => setModalOpen(false) }]}
            >
              <Modal.Section>
                <BlockStack gap="300">
                  <TextField label="Name" value={formData.name} onChange={(v) => setFormData((p) => ({ ...p, name: v, handle: slugManuallyEdited ? p.handle : titleToHandle(v) }))} placeholder="e.g. My Brand" autoComplete="off" />
                  <TextField label="Handle" value={formData.handle} onChange={(v) => { setSlugManuallyEdited(true); setFormData((p) => ({ ...p, handle: v })); }} placeholder="e.g. my-brand" autoComplete="off" helpText="URL-friendly key. Auto-filled from name unless edited." />
                  <Text as="p" variant="bodyMd" fontWeight="medium">Logo</Text>
                  <InlineStack gap="300" blockAlign="center">
                    {formData.logo_image ? (
                      <Box><img src={formData.logo_image} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} /><Button size="slim" variant="plain" tone="critical" onClick={() => setFormData((p) => ({ ...p, logo_image: "" }))}>Remove</Button></Box>
                    ) : null}
                    <DropZone accept="image/*" type="image" onDropAccepted={handleLogoDrop} allowMultiple={false}>
                      <div style={{ width: 80, height: 80, border: "2px dashed var(--p-color-border)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--p-color-bg-fill-secondary)", cursor: "pointer" }}>{logoUploading ? "…" : "+"}</div>
                    </DropZone>
                    <Button size="slim" variant="secondary" onClick={openMediaPicker}>Mevcut medyadan seç</Button>
                  </InlineStack>
                  <TextField label="Address" value={formData.address} onChange={(v) => setFormData((p) => ({ ...p, address: v }))} placeholder="Optional" multiline={2} autoComplete="off" />
                </BlockStack>
              </Modal.Section>
            </Modal>

            {loading ? (
              <Box padding="800">
                <Text as="p" tone="subdued">Loading…</Text>
              </Box>
            ) : brands.length === 0 ? (
              <Box padding="800" background="bg-surface-secondary" borderRadius="200">
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">No brands yet</Text>
                  <Text as="p" tone="subdued">Add a brand to use in product form (Brand dropdown).</Text>
                </BlockStack>
              </Box>
            ) : (
              <BlockStack gap="300">
                {brands.map((brand) => (
                  <Card key={brand.id} padding="400">
                    <InlineStack gap="400" blockAlign="center" wrap>
                      <Box minWidth="48px" minHeight="48px" background="bg-fill-secondary" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                        {brand.logo_image ? (
                          <img src={brand.logo_image} alt={brand.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "50%" }} />
                        ) : (
                          <Text as="span" variant="bodyMd" tone="subdued">—</Text>
                        )}
                      </Box>
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">{brand.name}</Text>
                        {brand.handle && <Text as="p" variant="bodySm" tone="subdued">{brand.handle}</Text>}
                        {brand.address && <Text as="p" variant="bodySm" tone="subdued">{brand.address}</Text>}
                      </BlockStack>
                      <Button variant="plain" tone="critical" onClick={() => handleDelete(brand.id)}>Delete</Button>
                    </InlineStack>
                  </Card>
                ))}
              </BlockStack>
            )}
          </BlockStack>
        </Card>

        <Modal open={mediaPickerOpen} onClose={() => setMediaPickerOpen(false)} title="Logo seç">
          <Modal.Section>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8, maxHeight: 280, overflowY: "auto" }}>
              {mediaLibraryList.map((item) => {
                const url = item.url && (item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`);
                return url ? <button key={item.id} type="button" onClick={() => pickLogo(item.url)} style={{ padding: 0, border: "none", borderRadius: 8, overflow: "hidden" }}><Thumbnail source={url} alt="" size="small" /></button> : null;
              })}
            </div>
          </Modal.Section>
        </Modal>
      </BlockStack>
    </Page>
  );
}
