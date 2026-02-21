"use client";

import React, { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  TextField,
  BlockStack,
  Box,
  Banner,
  Button,
  InlineStack,
  IndexTable,
  EmptyState,
  Modal,
} from "@shopify/polaris";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

function slugFromTitle(title) {
  if (!title || typeof title !== "string") return "";
  return title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function ProductCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ title: "", handle: "" });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const client = getMedusaAdminClient();

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const ids = new Set();
      const list = [];

      try {
        const data = await client.getMedusaCollections({ adminHub: true });
        const allList = data?.collections || [];
        for (const c of allList) {
          if (c?.id && !ids.has(c.id)) {
            ids.add(c.id);
            list.push({
              id: c.id,
              title: c.title ?? c.name,
              handle: c.handle ?? c.slug,
              _standalone: !!c._standalone,
            });
          }
        }
      } catch (_) {}

      setCollections(list);
    } catch (err) {
      setError(err?.message || "Failed to load collections");
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openAdd = () => {
    setForm({ title: "", handle: "" });
    setSlugManuallyEdited(false);
    setError(null);
    setModalOpen(true);
  };

  const handleTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      handle: slugManuallyEdited ? prev.handle : slugFromTitle(value),
    }));
  };

  const handleSubmit = async () => {
    const title = (form.title || "").trim();
    const handle = (form.handle || "").trim() || slugFromTitle(title);
    if (!title) {
      setError("Title is required.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await client.createCollection({ title, handle: handle || slugFromTitle(title), standalone: true });
      setModalOpen(false);
      await fetchCollections();
    } catch (err) {
      setError(err?.message || "Failed to create collection");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      setError(null);
      await client.deleteCollection(deleteId);
      setDeleteId(null);
      await fetchCollections();
    } catch (err) {
      setError(err?.message || "Failed to delete collection");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Page
      title="Collections"
      subtitle="Product collections (create here or from Content → Categories with Has collection)"
      primaryAction={{ content: "Add collection", onAction: openAdd }}
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner tone="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </Layout.Section>
        )}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Collections
              </Text>
              {loading ? (
                <Box paddingBlock="400">
                  <Text as="p" tone="subdued">
                    Loading…
                  </Text>
                </Box>
              ) : collections.length === 0 ? (
                <EmptyState
                  heading="No collections yet"
                  action={{ content: "Add collection", onAction: openAdd }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Click &quot;Add collection&quot; to create a new collection. It will appear in this list.</p>
                </EmptyState>
              ) : (
                <IndexTable
                  resourceName={{ singular: "collection", plural: "collections" }}
                  itemCount={collections.length}
                  selectable={false}
                  headings={[{ title: "Title" }, { title: "Handle" }, { title: "ID" }, { title: "" }]}
                >
                  {collections.map((col, index) => (
                    <IndexTable.Row id={col.id} key={col.id} position={index}>
                      <IndexTable.Cell>
                        <Text as="span" fontWeight="medium">
                          {col.title ?? col.name ?? "—"}
                        </Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Text as="span" tone="subdued">
                          {col.handle ?? "—"}
                        </Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Text as="span" variant="bodySm" tone="subdued">
                          {col.id}
                        </Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        {col._standalone ? (
                          <Button size="slim" tone="critical" onClick={() => setDeleteId(col.id)}>
                            Delete
                          </Button>
                        ) : (
                          <Text as="span" variant="bodySm" tone="subdued">
                            —
                          </Text>
                        )}
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={!!deleteId}
        onClose={() => !deleting && setDeleteId(null)}
        title="Delete collection"
        primaryAction={{
          content: deleting ? "Deleting…" : "Delete",
          destructive: true,
          onAction: handleDeleteCollection,
          loading: deleting,
        }}
        secondaryActions={[{ content: "Cancel", onAction: () => setDeleteId(null) }]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to delete &quot;{collections.find((c) => c.id === deleteId)?.title || "this collection"}&quot;?
          </Text>
        </Modal.Section>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title="Add collection"
        primaryAction={{
          content: saving ? "Creating…" : "Create",
          onAction: handleSubmit,
          loading: saving,
        }}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              label="Title"
              value={form.title}
              onChange={handleTitleChange}
              placeholder="e.g. Summer Sale"
              autoComplete="off"
            />
            <TextField
              label="Handle (slug)"
              value={form.handle}
              onChange={(value) => {
                setSlugManuallyEdited(true);
                setForm((prev) => ({ ...prev, handle: value }));
              }}
              placeholder="e.g. summer-sale"
              autoComplete="off"
              helpText="URL-friendly; auto-filled from title."
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
