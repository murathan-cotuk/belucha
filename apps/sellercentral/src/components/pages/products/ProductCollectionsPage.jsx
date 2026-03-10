"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Box,
  Banner,
  Button,
  InlineStack,
  IndexTable,
  EmptyState,
  Modal,
} from "@shopify/polaris";
import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

export default function ProductCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
              _fromCategory: !!c._fromCategory,
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

  const openAdd = () => router.push("/products/collections/new");
  const openEdit = (col) => router.push(`/products/collections/${col.id}`);

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
      subtitle="Add or edit a collection to open its full form in a new page."
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
                        <Link href={`/products/collections/${col.id}`} style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}>
                          {col.title ?? col.name ?? "—"}
                        </Link>
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
                        <InlineStack gap="200">
                          <Button size="slim" variant="plain" tone="subdued" accessibilityLabel="Edit" icon={EditIcon} onClick={() => openEdit(col)} />
                          <Button size="slim" variant="plain" tone="critical" accessibilityLabel="Delete" icon={DeleteIcon} onClick={() => setDeleteId(col.id)} />
                        </InlineStack>
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
    </Page>
  );
}
