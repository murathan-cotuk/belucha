"use client";

import React, { useState, useEffect } from "react";
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
} from "@shopify/polaris";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

export default function BrandPage() {
  const client = getMedusaAdminClient();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", logo_image: "", address: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

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
    setCreating(true);
    setMessage({ type: "", text: "" });
    try {
      await client.createBrand({
        name,
        logo_image: (formData.logo_image || "").trim() || undefined,
        address: (formData.address || "").trim() || undefined,
      });
      setMessage({ type: "success", text: "Brand created." });
      setFormData({ name: "", logo_image: "", address: "" });
      setModalOpen(false);
      loadBrands();
    } catch (e) {
      setMessage({ type: "error", text: e?.message || "Failed to create brand." });
    } finally {
      setCreating(false);
    }
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
                  <TextField
                    label="Name"
                    value={formData.name}
                    onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
                    placeholder="e.g. My Brand"
                    autoComplete="off"
                  />
                  <TextField
                    label="Logo (URL)"
                    value={formData.logo_image}
                    onChange={(v) => setFormData((p) => ({ ...p, logo_image: v }))}
                    placeholder="https://…"
                    autoComplete="off"
                  />
                  <TextField
                    label="Address"
                    value={formData.address}
                    onChange={(v) => setFormData((p) => ({ ...p, address: v }))}
                    placeholder="Optional"
                    multiline={2}
                    autoComplete="off"
                  />
                  <Text as="p" variant="bodySm" tone="subdued">
                    Handle is auto-generated from name.
                  </Text>
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
      </BlockStack>
    </Page>
  );
}
