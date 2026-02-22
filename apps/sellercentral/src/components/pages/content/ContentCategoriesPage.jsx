"use client";

import React, { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  TextField,
  BlockStack,
  InlineStack,
  Box,
  Banner,
  Divider,
  Checkbox,
  Modal,
  Select,
  IndexTable,
  useIndexResourceState,
  Badge,
} from "@shopify/polaris";
import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

function slugFromName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Parse semicolon-separated hierarchical CSV into a flat create list (key, label, parentKey, sortOrder). */
function parseCategoriesCsvToCreateList(csvText) {
  const lines = (csvText || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0];
  const rows = lines.slice(1);
  const separator = header.includes(";") ? ";" : ",";
  const labelMap = {};
  const childrenMap = {};
  const seenKeys = new Set();
  for (const line of rows) {
    const segments = line.split(separator).map((s) => s.trim()).filter(Boolean);
    for (let i = 0; i < segments.length; i++) {
      const label = segments[i];
      const parentKey = i === 0 ? "" : segments.slice(0, i).join("|");
      const key = segments.slice(0, i + 1).join("|");
      if (!label) continue;
      labelMap[key] = label;
      if (!childrenMap[parentKey]) childrenMap[parentKey] = [];
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        childrenMap[parentKey].push(key);
      }
    }
  }
  const createList = [];
  const queue = [""];
  while (queue.length) {
    const parentKey = queue.shift();
    const childKeys = childrenMap[parentKey] || [];
    for (let i = 0; i < childKeys.length; i++) {
      const key = childKeys[i];
      createList.push({ key, label: labelMap[key] || key, parentKey, sortOrder: i });
      queue.push(key);
    }
  }
  return createList;
}

function buildTree(flatList) {
  const byId = new Map(flatList.map((c) => [c.id, { ...c, children: [] }]));
  const roots = [];
  for (const c of flatList) {
    const node = byId.get(c.id);
    if (!c.parent_id) {
      roots.push(node);
    } else {
      const parent = byId.get(c.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  }
  const sort = (arr) => arr.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || (a.name || "").localeCompare(b.name || ""));
  sort(roots);
  roots.forEach((r) => sort(r.children));
  return roots;
}

function flattenTree(tree, level = 0) {
  let out = [];
  for (const node of tree) {
    out.push({ ...node, _level: level });
    if (node.children?.length) out = out.concat(flattenTree(node.children, level + 1));
  }
  return out;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  parent_id: "",
  has_collection: false,
  active: true,
  is_visible: true,
  collection_id: "",
};
const initialSlugTouched = false;

export default function ContentCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(initialSlugTouched);
  const [medusaCollections, setMedusaCollections] = useState([]);
  const [importCsvOpen, setImportCsvOpen] = useState(false);
  const [importCsvFile, setImportCsvFile] = useState(null);
  const [importProgress, setImportProgress] = useState(null); // { total, done, error } | null
  const client = getMedusaAdminClient();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await client.getAdminHubCategories({ all: true });
      setCategories(data.categories || []);
    } catch (err) {
      setError(err?.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    client.getMedusaCollections({ adminHub: true }).then((r) => setMedusaCollections(r.collections || [])).catch(() => setMedusaCollections([]));
  }, []);

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugManuallyEdited ? prev.slug : slugFromName(value),
    }));
  };

  const openCreate = () => {
    setEditId(null);
    setSlugManuallyEdited(false);
    setForm({ ...emptyForm, parent_id: "" });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditId(cat.id);
    setSlugManuallyEdited(false);
    setForm({
      name: cat.name || "",
      slug: cat.slug || slugFromName(cat.name || ""),
      description: cat.description || "",
      parent_id: cat.parent_id || "",
      has_collection: !!cat.has_collection,
      active: !!cat.active,
      is_visible: !!cat.is_visible,
      collection_id: (cat.metadata && cat.metadata.collection_id) || "",
    });
    setModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      setError(null);
      await client.deleteAdminHubCategory(deleteId);
      setDeleteId(null);
      await fetchCategories();
    } catch (err) {
      setError(err?.message || "Failed to delete category. Delete or move child categories first.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    const name = (form.name || "").trim();
    const slug = (form.slug || slugFromName(name)).trim();
    if (!name || !slug) {
      setError("Name and slug are required.");
      return;
    }
    const payload = {
      name,
      slug,
      description: (form.description || "").trim() || undefined,
      parent_id: form.parent_id || null,
      has_collection: !!form.has_collection,
      active: !!form.active,
      is_visible: !!form.is_visible,
      metadata: form.collection_id ? { collection_id: form.collection_id } : undefined,
    };

    try {
      if (editId) {
        setSaving(true);
        setError(null);
        await client.updateAdminHubCategory(editId, payload);
        setModalOpen(false);
        await fetchCategories();
      } else {
        setCreating(true);
        setError(null);
        await client.createAdminHubCategory(payload);
        setModalOpen(false);
        setForm(emptyForm);
        await fetchCategories();
      }
    } catch (err) {
      setError(err?.message || (editId ? "Failed to update category" : "Failed to create category"));
    } finally {
      setCreating(false);
      setSaving(false);
    }
  };

  const runImportCsv = async () => {
    if (!importCsvFile) return;
    const file = importCsvFile;
    let text;
    try {
      text = await file.text();
    } catch (err) {
      setImportProgress({ total: 0, done: 0, error: err?.message || "Could not read file" });
      return;
    }
    const list = parseCategoriesCsvToCreateList(text);
    if (list.length === 0) {
      setImportProgress({ total: 0, done: 0, error: "No categories found. Use semicolon-separated columns (e.g. Main Category;Subcategory 1;...)." });
      return;
    }
    setImportProgress({ total: list.length, done: 0, error: null });
    try {
      const result = await client.importAdminHubCategories(list);
      setImportProgress((prev) => ({ ...prev, done: result?.imported ?? list.length, error: null }));
      await fetchCategories();
      setImportCsvOpen(false);
      setImportCsvFile(null);
      setImportProgress(null);
    } catch (err) {
      setImportProgress((prev) => ({
        ...(prev || { total: list.length, done: 0 }),
        error: err?.message || "Import failed",
      }));
    }
  };

  const tree = buildTree(categories);
  const flatRows = flattenTree(tree);
  const parentOptions = [{ label: "— None (top level) —", value: "" }, ...categories.filter((c) => !editId || c.id !== editId).map((c) => ({ label: c.name, value: c.id }))];

  const resourceName = { singular: "category", plural: "categories" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(flatRows);

  return (
    <Page
      title="Categories"
      primaryAction={{
        content: "Add category",
        onAction: openCreate,
      }}
      secondaryActions={[
        {
          content: "Import from CSV",
          onAction: () => setImportCsvOpen(true),
        },
      ]}
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
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingSm">
                  All categories
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {categories.length} {categories.length === 1 ? "category" : "categories"}
                </Text>
              </InlineStack>
              <Divider />

              {loading ? (
                <Box paddingBlock="400">
                  <Text as="p" tone="subdued">
                    Loading…
                  </Text>
                </Box>
              ) : categories.length === 0 ? (
                <Box paddingBlock="400">
                  <BlockStack gap="300">
                    <Text as="p" tone="subdued">
                      No categories yet. Add one to use in products and collections.
                    </Text>
                    <Button variant="primary" onClick={openCreate}>
                      Add category
                    </Button>
                  </BlockStack>
                </Box>
              ) : (
                <IndexTable
                  resourceName={resourceName}
                  itemCount={flatRows.length}
                  selectable={false}
                  headings={[
                    { title: "Name" },
                    { title: "Slug" },
                    { title: "Parent" },
                    { title: "Collection" },
                    { title: "Status" },
                    { title: "" },
                  ]}
                >
                  {flatRows.map((row, index) => (
                    <IndexTable.Row id={row.id} key={row.id} position={index}>
                      <IndexTable.Cell>
                        <Box paddingInlineStart={row._level ? `${row._level * 24 + 8}px` : "0"}>
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            {row._level ? `↳ ${row.name}` : row.name}
                          </Text>
                        </Box>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Text as="span" variant="bodySm" tone="subdued">
                          /{row.slug || "—"}
                        </Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Text as="span" variant="bodySm">
                          {row.parent_id ? categories.find((c) => c.id === row.parent_id)?.name || "—" : "—"}
                        </Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        {row.has_collection ? (
                          <Badge tone="success">Yes</Badge>
                        ) : (
                          <Text as="span" tone="subdued">
                            —
                          </Text>
                        )}
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <InlineStack gap="200">
                          {row.active && (
                            <Badge tone="success">Active</Badge>
                          )}
                          {!row.active && (
                            <Badge tone="critical">Inactive</Badge>
                          )}
                          {row.is_visible && (
                            <Badge>Visible</Badge>
                          )}
                        </InlineStack>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <InlineStack gap="200">
                          <Button size="slim" variant="plain" tone="subdued" accessibilityLabel="Edit" icon={EditIcon} onClick={() => openEdit(row)} />
                          <Button size="slim" variant="plain" tone="critical" accessibilityLabel="Delete" icon={DeleteIcon} onClick={() => setDeleteId(row.id)} />
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
        open={importCsvOpen}
        onClose={() => {
          if (!importProgress || importProgress.error || importProgress.done >= importProgress.total) {
            setImportCsvOpen(false);
            setImportCsvFile(null);
            setImportProgress(null);
          }
        }}
        title="Import categories from CSV"
        primaryAction={{
          content: importProgress != null && importProgress.done < importProgress.total && !importProgress.error ? "Importing…" : "Import",
          onAction: runImportCsv,
          loading: importProgress != null && !importProgress?.error && importProgress.done < importProgress.total,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              if (!(importProgress != null && importProgress.done < importProgress.total)) {
                setImportCsvOpen(false);
                setImportCsvFile(null);
                setImportProgress(null);
              }
            },
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p" tone="subdued">
              Upload a semicolon-separated CSV with columns like: Main Category;Subcategory 1;Subcategory 2;… Categories are saved to the same list as panel categories and will appear here.
            </Text>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Text as="span" variant="bodyMd" fontWeight="medium">CSV file</Text>
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setImportCsvFile(f || null);
                  if (!f) setImportProgress(null);
                }}
              />
            </label>
            {importProgress != null && (
              <BlockStack gap="200">
                {importProgress.error ? (
                  <Banner tone="critical" onDismiss={() => setImportProgress(null)}>{importProgress.error}</Banner>
                ) : (
                  <Text as="p" variant="bodyMd">
                    {importProgress.done >= importProgress.total ? `Imported ${importProgress.done} categories.` : `Importing… ${importProgress.done} / ${importProgress.total}`}
                  </Text>
                )}
              </BlockStack>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>

      <Modal
        open={!!deleteId}
        onClose={() => !deleting && setDeleteId(null)}
        title="Delete category"
        primaryAction={{
          content: deleting ? "Deleting…" : "Delete",
          destructive: true,
          onAction: handleDeleteCategory,
          loading: deleting,
        }}
        secondaryActions={[{ content: "Cancel", onAction: () => setDeleteId(null) }]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to delete &quot;{categories.find((c) => c.id === deleteId)?.name || "this category"}&quot;?
            {categories.some((c) => c.parent_id === deleteId) && " This category has subcategories; delete or move them first."}
          </Text>
        </Modal.Section>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => {
          if (!creating && !saving) setModalOpen(false);
        }}
        title={editId ? "Edit category" : "Add category"}
        primaryAction={{
          content: creating || saving ? (editId ? "Saving…" : "Creating…") : editId ? "Save" : "Create",
          onAction: handleSubmit,
          loading: creating || saving,
        }}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Select
              label="Parent category (subcategory)"
              options={parentOptions}
              value={form.parent_id}
              onChange={(value) => setForm((prev) => ({ ...prev, parent_id: value }))}
            />
            <TextField
              label="Name"
              value={form.name}
              onChange={handleNameChange}
              autoComplete="off"
              placeholder="e.g. Electronics"
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(value) => {
                setSlugManuallyEdited(true);
                setForm((prev) => ({ ...prev, slug: value }));
              }}
              autoComplete="off"
              placeholder="e.g. sports-outdoors"
              helpText="Auto-filled from name (e.g. Sports & Outdoors → sports-outdoors). You can change it."
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
              multiline={2}
              autoComplete="off"
            />
            <Checkbox
              label="Has collection (create or link collection page)"
              checked={form.has_collection}
              onChange={(value) => setForm((prev) => ({ ...prev, has_collection: value }))}
            />
            {form.has_collection && (
              <Select
                label="Link to existing collection (optional)"
                options={[
                  { label: "— Auto-create new collection —", value: "" },
                  ...medusaCollections.map((c) => ({ label: c.title || c.handle || c.id, value: c.id })),
                ]}
                value={form.collection_id}
                onChange={(value) => setForm((prev) => ({ ...prev, collection_id: value }))}
                helpText="Leave as 'Auto-create' for 'Parent > Child' or category name collection."
              />
            )}
            <Checkbox
              label="Active"
              checked={form.active}
              onChange={(value) => setForm((prev) => ({ ...prev, active: value }))}
            />
            <Checkbox
              label="Visible in store"
              checked={form.is_visible}
              onChange={(value) => setForm((prev) => ({ ...prev, is_visible: value }))}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
