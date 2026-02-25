"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  Text,
  TextField,
  BlockStack,
  InlineStack,
  Box,
  Banner,
  Select,
  DropZone,
} from "@shopify/polaris";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

const getDefaultBaseUrl = () => {
  const env = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "";
  const url = (typeof env === "string" ? env : "").trim();
  return url || (typeof window !== "undefined" ? "http://localhost:9000" : "");
};

function descriptionVisualToHtml(html) {
  const s = (html || "").trim();
  if (!s) return "";
  if (/<(p|div|h[1-6]|ul|ol|li)\b/i.test(s)) return s;
  return "<p>" + s + "</p>";
}

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;

function slugFromTitle(title) {
  if (!title || typeof title !== "string") return "";
  return title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function buildTree(flatList) {
  if (!Array.isArray(flatList)) return [];
  const byId = new Map(flatList.map((c) => [c.id, { ...c, children: [] }]));
  const roots = [];
  for (const c of flatList) {
    const node = byId.get(c.id);
    if (!c.parent_id) roots.push(node);
    else {
      const parent = byId.get(c.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  }
  return roots;
}

function flattenTree(tree, level = 0) {
  if (!Array.isArray(tree)) return [];
  let out = [];
  for (const node of tree) {
    out.push({ ...node, _level: level });
    if (node.children?.length) out = out.concat(flattenTree(node.children, level + 1));
  }
  return out;
}

export default function CollectionEditPage({ collection: initialCollection, isNew, onReload }) {
  const router = useRouter();
  const client = getMedusaAdminClient();
  const baseUrl = (client.baseURL || getDefaultBaseUrl()).replace(/\/$/, "");
  const [collection, setCollection] = useState(initialCollection ?? null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [richtextMode, setRichtextMode] = useState("visual");
  const richtextEditorRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    handle: "",
    category_id: "",
    display_title: "",
    meta_title: "",
    meta_description: "",
    keywords: "",
    richtext: "",
    image_url: "",
    banner_image_url: "",
  });

  useEffect(() => {
    if (initialCollection) {
      setCollection(initialCollection);
      setForm((prev) => ({
        ...prev,
        title: initialCollection.title ?? "",
        handle: initialCollection.handle ?? "",
        category_id: "",
        display_title: initialCollection.display_title ?? initialCollection.title ?? "",
        meta_title: initialCollection.meta_title ?? "",
        meta_description: initialCollection.meta_description ?? "",
        keywords: initialCollection.keywords ?? "",
        richtext: initialCollection.richtext ?? initialCollection.description_html ?? "",
        image_url: initialCollection.image_url ?? "",
        banner_image_url: initialCollection.banner_image_url ?? "",
      }));
    }
  }, [initialCollection]);

  useEffect(() => {
    if (richtextMode === "visual" && richtextEditorRef.current) richtextEditorRef.current.innerHTML = form.richtext || "";
  }, [richtextMode, form.richtext]);

  const handleMainImageDrop = useCallback(
    (files) => {
      setMediaUploading(true);
      const file = Array.isArray(files) ? files[0] : files;
      if (!file) return setMediaUploading(false);
      const fd = new FormData();
      fd.append("file", file);
      client
        .uploadMedia(fd)
        .then((r) => {
          const url = r?.url ? `${baseUrl}${r.url}` : null;
          if (url) setForm((prev) => ({ ...prev, image_url: url }));
        })
        .catch(() => setError("Upload failed"))
        .finally(() => setMediaUploading(false));
    },
    [client, baseUrl]
  );
  const handleBannerImageDrop = useCallback(
    (files) => {
      setMediaUploading(true);
      const file = Array.isArray(files) ? files[0] : files;
      if (!file) return setMediaUploading(false);
      const fd = new FormData();
      fd.append("file", file);
      client
        .uploadMedia(fd)
        .then((r) => {
          const url = r?.url ? `${baseUrl}${r.url}` : null;
          if (url) setForm((prev) => ({ ...prev, banner_image_url: url }));
        })
        .catch(() => setError("Upload failed"))
        .finally(() => setMediaUploading(false));
    },
    [client, baseUrl]
  );

  useEffect(() => {
    client.getAdminHubCategories({ all: true }).then((r) => setCategories(r.categories || [])).catch(() => setCategories([]));
  }, []);

  const handleTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      handle: slugManuallyEdited ? prev.handle : slugFromTitle(value),
      display_title: prev.display_title === (prev.title || "") ? value : prev.display_title,
    }));
  };

  const handleSave = async () => {
    const title = (form.title || "").trim();
    const handle = (form.handle || "").trim() || slugFromTitle(title);
    if (!title) {
      setError("Title is required.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      if (isNew) {
        const created = await client.createCollection({
          title,
          handle: handle || slugFromTitle(title),
          standalone: true,
          ...(form.category_id && { category_id: form.category_id }),
        });
        if (created?.id) router.replace(`/products/collections/${created.id}`);
        else await (onReload?.() ?? Promise.resolve());
      } else if (collection?.id) {
        await client.updateCollection(collection.id, {
          title,
          handle: handle || slugFromTitle(title),
          ...(form.category_id !== undefined && { category_id: form.category_id || undefined }),
        });
        const updated = await client.getCollection(collection.id);
        if (updated) setCollection(updated);
        onReload?.();
      }
    } catch (err) {
      setError(err?.message || (isNew ? "Failed to create collection" : "Failed to update collection"));
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = [
    { label: "— None —", value: "" },
    ...flattenTree(buildTree(categories)).map((c) => ({
      label: (c._level ? "  ".repeat(c._level) + "↳ " : "") + (c.name || c.slug || c.id),
      value: c.id,
    })),
  ];

  return (
    <Page
      title={isNew ? "New collection" : (collection?.title || "Edit collection")}
      backAction={{ content: "Collections", onAction: () => router.push("/products/collections") }}
      primaryAction={{
        content: saving ? "Saving…" : "Save",
        onAction: handleSave,
        loading: saving,
      }}
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
                Basic
              </Text>
              <TextField
                label="Collection name"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Summer Sale"
                autoComplete="off"
                helpText="Used in menus and admin."
              />
              <TextField
                label="Handle (URL slug)"
                value={form.handle}
                onChange={(value) => {
                  setSlugManuallyEdited(true);
                  setForm((prev) => ({ ...prev, handle: value }));
                }}
                placeholder="e.g. summer-sale"
                autoComplete="off"
                helpText="URL: /collections/[handle]"
              />
              <Select
                label="Link to category (optional)"
                options={categoryOptions}
                value={form.category_id}
                onChange={(value) => setForm((prev) => ({ ...prev, category_id: value }))}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Shop page</Text>
              <TextField
                label="Display title (h1 on collection page)"
                value={form.display_title}
                onChange={(value) => setForm((prev) => ({ ...prev, display_title: value }))}
                placeholder="Same as collection name if empty"
                autoComplete="off"
              />
              <Text as="p" variant="bodySm" fontWeight="medium">Main image (menus, dropdown)</Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
                {form.image_url ? (
                  <div style={{ width: 100, aspectRatio: 1, borderRadius: 8, overflow: "hidden", background: "var(--p-color-bg-fill-secondary)", position: "relative" }}>
                    <img src={form.image_url.startsWith("http") || form.image_url.startsWith("data:") ? form.image_url : `${baseUrl}${form.image_url}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))} style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, border: "none", borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer", fontSize: 14 }} aria-label="Remove">×</button>
                  </div>
                ) : null}
                {!form.image_url && (
                  <DropZone accept="image/*" type="image" onDropAccepted={handleMainImageDrop} allowMultiple={false}>
                    <div style={{ width: 100, aspectRatio: 1, borderRadius: 8, border: "2px dashed var(--p-color-border)", background: "var(--p-color-bg-fill-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <span style={{ fontSize: 24, color: "var(--p-color-icon)" }}>+</span>
                    </div>
                  </DropZone>
                )}
              </div>
              <Text as="p" variant="bodySm" fontWeight="medium">Banner image (1920×300 px, full-width)</Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
                {form.banner_image_url ? (
                  <div style={{ maxWidth: 320, height: 50, borderRadius: 8, overflow: "hidden", background: "var(--p-color-bg-fill-secondary)", position: "relative" }}>
                    <img src={form.banner_image_url.startsWith("http") || form.banner_image_url.startsWith("data:") ? form.banner_image_url : `${baseUrl}${form.banner_image_url}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, banner_image_url: "" }))} style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, border: "none", borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer", fontSize: 14 }} aria-label="Remove">×</button>
                  </div>
                ) : null}
                {!form.banner_image_url && (
                  <DropZone accept="image/*" type="image" onDropAccepted={handleBannerImageDrop} allowMultiple={false}>
                    <div style={{ width: 200, height: 50, borderRadius: 8, border: "2px dashed var(--p-color-border)", background: "var(--p-color-bg-fill-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <span style={{ fontSize: 18, color: "var(--p-color-icon)" }}>+ Banner</span>
                    </div>
                  </DropZone>
                )}
              </div>
              {mediaUploading && <Text as="p" variant="bodySm" tone="subdued">Uploading…</Text>}
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" fontWeight="medium">Richtext (below products on collection page)</Text>
                <div className="collection-description-box" style={{ border: "1px solid var(--p-color-border)", borderRadius: 12, overflow: "hidden", background: "var(--p-color-bg-surface)" }}>
                  <div className="collection-description-toolbar" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--p-color-bg-surface-secondary)", borderBottom: "1px solid var(--p-color-border)" }}>
                    {richtextMode === "visual" && (
                      <>
                        <button type="button" className="collection-desc-btn" style={{ width: 32, height: 32, padding: 0, border: "none", borderRadius: 6, cursor: "pointer", background: "transparent", color: "var(--p-color-text-subdued)" }} onMouseDown={(e) => { e.preventDefault(); document.execCommand("bold"); }} title="Bold">B</button>
                        <button type="button" className="collection-desc-btn" style={{ width: 32, height: 32, padding: 0, border: "none", borderRadius: 6, cursor: "pointer", background: "transparent", color: "var(--p-color-text-subdued)" }} onMouseDown={(e) => { e.preventDefault(); document.execCommand("italic"); }} title="Italic">I</button>
                        <button type="button" className="collection-desc-btn" style={{ width: 32, height: 32, padding: 0, border: "none", borderRadius: 6, cursor: "pointer", background: "transparent", color: "var(--p-color-text-subdued)" }} onMouseDown={(e) => { e.preventDefault(); document.execCommand("insertUnorderedList"); }} title="List">•</button>
                      </>
                    )}
                    <button type="button" style={{ marginLeft: 8, width: 32, height: 32, padding: 0, border: "none", borderRadius: 6, cursor: "pointer", background: richtextMode === "html" ? "var(--p-color-bg-surface-selected)" : "transparent", color: "var(--p-color-text-subdued)" }} onClick={() => { if (richtextMode === "visual" && richtextEditorRef.current) setForm((prev) => ({ ...prev, richtext: descriptionVisualToHtml(richtextEditorRef.current.innerHTML || "") })); else if (richtextMode !== "visual" && richtextEditorRef.current) richtextEditorRef.current.innerHTML = form.richtext || ""; setRichtextMode(richtextMode === "html" ? "visual" : "html"); }} title="HTML">{"</>"}</button>
                  </div>
                  {richtextMode === "html" ? (
                    <textarea style={{ minHeight: 160, width: "100%", padding: 16, fontFamily: "ui-monospace, monospace", fontSize: 13, border: "none", resize: "vertical", boxSizing: "border-box" }} value={form.richtext || ""} onChange={(e) => setForm((prev) => ({ ...prev, richtext: e.target.value }))} placeholder="<h2>Heading</h2><p>…</p>" />
                  ) : (
                    <div ref={richtextEditorRef} contentEditable suppressContentEditableWarning style={{ minHeight: 160, padding: 16, outline: "none", fontSize: 14, lineHeight: 1.6 }} onBlur={() => { if (richtextEditorRef.current) setForm((prev) => ({ ...prev, richtext: descriptionVisualToHtml(richtextEditorRef.current.innerHTML || "") })); }} />
                  )}
                </div>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">SEO</Text>
              <Box position="relative">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Text as="span" variant="bodySm" tone="subdued">Meta title</Text>
                  <Text as="span" variant="bodySm" tone="subdued">{(form.meta_title || "").length} / {META_TITLE_MAX}</Text>
                </div>
                <TextField label="" labelHidden value={form.meta_title} onChange={(v) => setForm((prev) => ({ ...prev, meta_title: v.slice(0, META_TITLE_MAX) }))} placeholder="Meta title" autoComplete="off" />
              </Box>
              <Box position="relative">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Text as="span" variant="bodySm" tone="subdued">Meta description</Text>
                  <Text as="span" variant="bodySm" tone="subdued">{(form.meta_description || "").length} / {META_DESC_MAX}</Text>
                </div>
                <TextField label="" labelHidden value={form.meta_description} onChange={(v) => setForm((prev) => ({ ...prev, meta_description: v.slice(0, META_DESC_MAX) }))} placeholder="Meta description" multiline={2} autoComplete="off" />
              </Box>
              <TextField label="Keywords" value={form.keywords} onChange={(value) => setForm((prev) => ({ ...prev, keywords: value }))} placeholder="comma-separated" autoComplete="off" />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
