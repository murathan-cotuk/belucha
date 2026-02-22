"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Select,
  ChoiceList,
  DropZone,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { ProductIcon, SearchIcon } from "@shopify/polaris-icons";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";
import ProductDescriptionEditor from "@/components/inputs/ProductDescriptionEditor";

const getDefaultBaseUrl = () => {
  const env = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "";
  const url = (typeof env === "string" ? env : "").trim();
  return url || (typeof window !== "undefined" ? "http://localhost:9000" : "");
};

const STATUS_OPTIONS = [
  { label: "Active", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Inactive", value: "archived" },
];

const UNIT_TYPE_OPTIONS = [
  { label: "— None —", value: "" },
  { label: "kg", value: "kg" },
  { label: "g", value: "g" },
  { label: "L", value: "L" },
  { label: "ml", value: "ml" },
  { label: "Piece", value: "stück" },
];

function getEmptyProduct() {
  return {
    title: "",
    handle: "",
    sku: "",
    description: "",
    status: "draft",
    price: 0,
    inventory: 0,
    metadata: {},
    variants: [],
  };
}

function getMeta(product, key, fallback = "") {
  const m = product?.metadata;
  if (!m || typeof m !== "object") return fallback;
  return m[key] != null && m[key] !== "" ? String(m[key]) : fallback;
}

function setMeta(product, key, value) {
  const m = { ...(product?.metadata && typeof product.metadata === "object" ? product.metadata : {}) };
  if (value === "" || value == null) delete m[key]; else m[key] = value;
  return { ...product, metadata: m };
}

export default function ProductEditPage({ product: initialProduct, idOrHandle, isNew, onReload }) {
  const router = useRouter();
  const client = getMedusaAdminClient();
  const baseUrl = (client.baseURL || getDefaultBaseUrl()).replace(/\/$/, "");
  const [product, setProduct] = useState(() => initialProduct ?? (isNew ? getEmptyProduct() : null));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const initialSnapshotRef = useRef(null);

  useEffect(() => {
    const next = initialProduct ?? (isNew ? getEmptyProduct() : null);
    setProduct((prev) => next ?? prev);
    if (next) initialSnapshotRef.current = JSON.stringify(normalizeForCompare(next));
  }, [initialProduct, isNew]);

  useEffect(() => {
    client.getAdminHubCategories({ all: true }).then((r) => setCategories(r.categories || [])).catch(() => setCategories([]));
  }, [client]);

  useEffect(() => {
    client.getMedusaCollections({ adminHub: true }).then((r) => setCollections(r.collections || [])).catch(() => setCollections([]));
  }, [client]);

  function normalizeForCompare(p) {
    if (!p) return null;
    return {
      title: p.title ?? "",
      handle: p.handle ?? "",
      sku: p.sku ?? "",
      description: p.description ?? "",
      status: p.status ?? "draft",
      price: p.price ?? 0,
      inventory: p.inventory ?? 0,
      metadata: p.metadata && typeof p.metadata === "object" ? p.metadata : {},
      variants: Array.isArray(p.variants) ? p.variants : [],
    };
  }
  const isDirty = product && initialSnapshotRef.current != null && JSON.stringify(normalizeForCompare(product)) !== initialSnapshotRef.current;

  const handleDiscard = () => {
    setProduct(initialProduct ?? (isNew ? getEmptyProduct() : null));
    if (initialProduct) initialSnapshotRef.current = JSON.stringify(normalizeForCompare(initialProduct));
    else if (isNew) initialSnapshotRef.current = JSON.stringify(normalizeForCompare(getEmptyProduct()));
  };

  const meta = product?.metadata && typeof product.metadata === "object" ? product.metadata : {};
  const uvp = meta.uvp_cents != null ? Number(meta.uvp_cents) / 100 : null;
  const rabattpreis = meta.rabattpreis_cents != null ? Number(meta.rabattpreis_cents) / 100 : null;
  const price = product?.price != null ? Number(product.price) : 0;
  const displayPrice = rabattpreis != null && rabattpreis > 0 ? rabattpreis : price;
  const hasDiscount = rabattpreis != null && rabattpreis > 0 && price > 0;

  const update = useCallback((updates) => {
    setProduct((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const updateMeta = useCallback((key, value) => {
    setProduct((prev) => {
      if (!prev) return prev;
      const m = { ...(prev.metadata && typeof prev.metadata === "object" ? prev.metadata : {}) };
      if (value === "" || value == null) delete m[key]; else m[key] = value;
      return { ...prev, metadata: m };
    });
  }, []);

  const save = async () => {
    if (!product) return;
    const handle = (product.handle || "").trim() || (product.title || "product").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/gi, "");
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const payload = {
        title: product.title || "Untitled",
        handle,
        sku: product.sku || "",
        description: product.description || "",
        status: product.status || "draft",
        price: product.price ?? 0,
        inventory: product.inventory ?? 0,
        metadata: product.metadata || {},
        variants: product.variants || [],
      };
      if (isNew) {
        const created = await client.createAdminHubProduct(payload);
        setMessage({ type: "success", text: "Product created" });
        onReload?.();
        router.push(`/products/${created?.handle || created?.id || idOrHandle}`);
        return;
      }
      await client.updateAdminHubProduct(idOrHandle, payload);
      setMessage({ type: "success", text: "Saved" });
      initialSnapshotRef.current = JSON.stringify(normalizeForCompare({ ...product, ...payload }));
      onReload?.();
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const duplicateProduct = async () => {
    if (!product) return;
    try {
      setSaving(true);
      const created = await client.createAdminHubProduct({
        title: (product.title || "") + " (Copy)",
        handle: (product.handle || "") + "-kopie-" + Date.now(),
        sku: product.sku || "",
        description: product.description || "",
        status: "draft",
        price: product.price,
        inventory: product.inventory ?? 0,
        metadata: product.metadata,
        variants: product.variants,
      });
      if (created?.id) router.push(`/products/${created.handle || created.id}`);
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Duplicate failed" });
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!product?.id) return;
    try {
      setSaving(true);
      await client.deleteAdminHubProduct(product.id);
      router.push("/products/inventory");
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Delete failed" });
    } finally {
      setSaving(false);
    }
  };

  const metafieldsList = Array.isArray(meta.metafields) ? meta.metafields : (meta.metafields && typeof meta.metafields === "object" ? Object.entries(meta.metafields).map(([k, v]) => ({ key: k, value: v })) : []);

  if (!product && !isNew) {
    return (
      <Page title="Product">
        <Card><BlockStack gap="300"><SkeletonDisplayText size="small" /><SkeletonBodyText lines={3} /></BlockStack></Card>
      </Page>
    );
  }

  const mediaUrls = (() => {
    const m = meta.media;
    if (Array.isArray(m)) return m.filter((u) => u != null && String(u).trim() !== "");
    if (m != null && String(m).trim() !== "") return [String(m)];
    return [];
  })();
  const collectionIds = Array.isArray(meta.collection_ids) ? meta.collection_ids : (meta.collection_id != null ? [meta.collection_id] : []);

  const handleMediaDrop = useCallback(
    (files) => {
      setMediaUploading(true);
      Promise.all(
        (Array.isArray(files) ? files : [files]).map((file) => {
          const fd = new FormData();
          fd.append("file", file);
          return client.uploadMedia(fd).then((r) => (r.url ? `${baseUrl}${r.url}` : null));
        })
      )
        .then((urls) => {
          const newUrls = urls.filter(Boolean);
          if (newUrls.length) updateMeta("media", [...mediaUrls, ...newUrls]);
        })
        .catch((err) => setMessage({ type: "error", text: err?.message || "Upload failed" }))
        .finally(() => setMediaUploading(false));
    },
    [mediaUrls, baseUrl, client, updateMeta]
  );
  const removeMedia = (index) => {
    const next = mediaUrls.filter((_, i) => i !== index);
    updateMeta("media", next);
  };

  return (
    <Page title="">
      <style>{`
        .product-edit-header { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .product-edit-header .product-edit-title-link { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; color: var(--p-color-text); font-size: 0.875rem; }
        .product-edit-header .product-edit-title-link:hover { color: var(--p-color-text); }
        .product-edit-header .product-edit-name { margin: 0; font-size: 0.875rem; font-weight: 700; }
        .product-edit-label { font-size: 0.8125rem; font-weight: 400; color: var(--p-color-text-subdued); margin-bottom: 4px; }
        .product-price-strike { text-decoration: line-through; color: var(--p-color-text-subdued); }
        .product-media-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; align-items: start; }
        .product-media-main { grid-column: span 2; grid-row: span 2; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: var(--p-color-bg-fill-secondary); position: relative; min-height: 120px; }
        .product-media-thumb { aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: var(--p-color-bg-fill-secondary); position: relative; min-height: 80px; }
        .product-media-add { grid-column: span 2; min-height: 100px; border-radius: 8px; }
      `}</style>

      {message.text && (
        <Box paddingBlockEnd="200">
          <Banner tone={message.type === "success" ? "success" : "critical"} onDismiss={() => setMessage({ type: "", text: "" })}>{message.text}</Banner>
        </Box>
      )}

      {isDirty && (
        <Box paddingBlockEnd="200">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "10px 12px", background: "var(--p-color-bg-surface-secondary)", borderRadius: 8, border: "1px solid var(--p-color-border)" }}>
            <span style={{ display: "inline-flex", transform: "rotate(180deg)", transition: "transform 0.25s ease" }} aria-hidden>
              <SearchIcon />
            </span>
            <span style={{ fontSize: 14, color: "var(--p-color-text)", fontWeight: 500 }}>Unsaved changes</span>
            <Button variant="secondary" size="slim" onClick={handleDiscard}>Discard</Button>
            <Button variant="primary" size="slim" onClick={save} loading={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </Box>
      )}

      <div className="product-edit-header">
        <Link href="/products/inventory" className="product-edit-title-link" style={{ marginRight: 4 }}>
          <span style={{ display: "flex", alignItems: "center", width: 20, height: 20 }}><ProductIcon /></span>
          <span className="product-edit-name">{isNew ? "New product" : (product?.title || "Product")}</span>
        </Link>
        <span style={{ flex: 1 }} />
        {!isNew && (
          <InlineStack gap="200">
            <Button variant="secondary" size="slim" onClick={duplicateProduct} loading={saving}>Duplicate</Button>
            <Button variant="primary" tone="critical" size="slim" onClick={() => setDeleteConfirmOpen(true)}>Delete</Button>
          </InlineStack>
        )}
      </div>

      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="bodyMd" fontWeight="regular">Title</Text>
              <TextField label="Title" labelHidden value={product.title || ""} onChange={(v) => update({ title: v })} placeholder="e.g. Cotton T-Shirt" autoComplete="off" />

              <Divider />
              <Text as="h2" variant="bodyMd" fontWeight="regular">SKU & EAN</Text>
              <InlineStack gap="300" wrap>
                <Box minWidth="240px" flex="1">
                  <TextField label="SKU" labelHidden value={product.sku || ""} onChange={(v) => update({ sku: v })} placeholder="SKU" autoComplete="off" />
                </Box>
                <Box minWidth="240px" flex="1">
                  <TextField label="EAN" labelHidden value={getMeta(product, "ean")} onChange={(v) => updateMeta("ean", v)} placeholder="EAN / Barcode" autoComplete="off" />
                </Box>
              </InlineStack>

              <Divider />
              <Text as="h2" variant="bodyMd" fontWeight="regular">Category & Brand</Text>
              <InlineStack gap="300" wrap>
                <Box minWidth="280px" flex="1">
                  <Select
                    label="Category"
                    labelHidden
                    options={[{ label: "— None —", value: "" }, ...(categories || []).map((c) => ({ label: c.name, value: c.id }))]}
                    value={getMeta(product, "category_id")}
                    onChange={(v) => updateMeta("category_id", v)}
                  />
                </Box>
                <Box minWidth="280px" flex="1">
                  <TextField label="Brand" labelHidden value={getMeta(product, "brand")} onChange={(v) => updateMeta("brand", v)} placeholder="Brand" autoComplete="off" />
                </Box>
              </InlineStack>

              <Divider />
              <Text as="h2" variant="bodyMd" fontWeight="regular">Description</Text>
              <ProductDescriptionEditor
                value={product.description || ""}
                onChange={(html) => update({ description: html })}
                placeholder="Product description…"
              />

              <Divider />
              <Text as="h2" variant="bodyMd" fontWeight="regular">Media</Text>
              <div className="product-media-grid">
                {mediaUrls[0] && (
                  <div className="product-media-main">
                    <img src={mediaUrls[0].startsWith("http") || mediaUrls[0].startsWith("data:") ? mediaUrls[0] : `${baseUrl}${mediaUrls[0]}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Button size="slim" variant="plain" tone="critical" onClick={() => removeMedia(0)} style={{ position: "absolute", top: 4, right: 4 }}>×</Button>
                  </div>
                )}
                {[1, 2, 3, 4].map((i) =>
                  mediaUrls[i] ? (
                    <div key={i} className="product-media-thumb">
                      <img src={mediaUrls[i].startsWith("http") || mediaUrls[i].startsWith("data:") ? mediaUrls[i] : `${baseUrl}${mediaUrls[i]}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <Button size="slim" variant="plain" tone="critical" onClick={() => removeMedia(i)} style={{ position: "absolute", top: 2, right: 2 }}>×</Button>
                    </div>
                  ) : null
                )}
                <DropZone accept="image/*" type="image" onDropAccepted={handleMediaDrop} allowMultiple>
                  <DropZone.FileUpload actionHint="Add images" />
                </DropZone>
              </div>
              {mediaUploading && <Text as="p" variant="bodySm" tone="subdued">Uploading…</Text>}

              <Divider />
              <Text as="h2" variant="bodyMd" fontWeight="regular">Pricing</Text>
              <InlineStack gap="300" wrap>
                <Box minWidth="120px">
                  <div className="product-edit-label">UVP (MSRP)</div>
                  <TextField type="number" value={uvp != null ? String(uvp) : ""} onChange={(v) => updateMeta("uvp_cents", v === "" ? "" : Math.round(parseFloat(v) * 100))} placeholder="0.00" prefix="€" />
                </Box>
                <Box minWidth="120px">
                  <div className="product-edit-label">Price</div>
                  <TextField type="number" value={product.price != null ? String(product.price) : ""} onChange={(v) => update({ price: v === "" ? 0 : parseFloat(v) })} placeholder="0.00" prefix="€" />
                </Box>
                <Box minWidth="120px">
                  <div className="product-edit-label">Sale price</div>
                  <TextField type="number" value={rabattpreis != null ? String(rabattpreis) : ""} onChange={(v) => updateMeta("rabattpreis_cents", v === "" ? "" : Math.round(parseFloat(v) * 100))} placeholder="—" prefix="€" />
                </Box>
              </InlineStack>
              {hasDiscount && (
                <Text as="p" variant="bodySm" tone="subdued">
                  Display: <span className="product-price-strike">€{price.toFixed(2)}</span> → €{displayPrice.toFixed(2)}
                </Text>
              )}

              <Divider />
              <Text as="h2" variant="bodyMd" fontWeight="regular">Inventory</Text>
              <Box minWidth="120px">
                <TextField label="Quantity" labelHidden type="number" value={product.inventory != null ? String(product.inventory) : "0"} onChange={(v) => update({ inventory: parseInt(v, 10) || 0 })} min={0} />
              </Box>
              <Text as="p" variant="bodySm" tone="subdued">Warehouse split can be set later in metadata.</Text>

              <Divider />
              <Text as="h2" variant="bodyMd" fontWeight="regular">Variants</Text>
              {Array.isArray(product.variants) && product.variants.length > 0 ? (
                product.variants.map((v, i) => (
                  <Box key={i} padding="300" background="bg-surface-secondary" borderRadius="200">
                    <Text as="p" variant="bodyMd">{v.title || v.name || `Variant ${i + 1}`} · {Array.isArray(v.options) ? v.options.map((o) => o.value).filter(Boolean).join(", ") : "—"}</Text>
                  </Box>
                ))
              ) : (
                <Text as="p" variant="bodySm" tone="subdued">No variants. Variants can be set when creating or via metadata.</Text>
              )}

              <Divider />
              <Text as="h2" variant="bodyMd" fontWeight="regular">Metafields (catalog)</Text>
              <Text as="p" variant="bodySm" tone="subdued">e.g. Material: 100% Cotton. Key = metafield name from catalog.</Text>
              {metafieldsList.length > 0 ? (
                metafieldsList.map((item, i) => (
                  <InlineStack key={i} gap="200" wrap>
                    <TextField label="Key" labelHidden value={item.key || ""} onChange={(v) => { const arr = [...metafieldsList]; arr[i] = { ...arr[i], key: v }; updateMeta("metafields", arr); }} placeholder="e.g. Material" />
                    <TextField label="Value" labelHidden value={item.value || ""} onChange={(v) => { const arr = [...metafieldsList]; arr[i] = { ...arr[i], value: v }; updateMeta("metafields", arr); }} placeholder="e.g. 100% Cotton" />
                  </InlineStack>
                ))
              ) : null}
              <Button variant="secondary" size="slim" onClick={() => updateMeta("metafields", [...metafieldsList, { key: "", value: "" }])}>+ Metafield</Button>

              <Divider />
              <Text as="h2" variant="bodyMd" fontWeight="regular">SEO</Text>
              <TextField label="Meta title" value={meta.seo_meta_title ?? ""} onChange={(v) => updateMeta("seo_meta_title", v)} placeholder="Meta title" autoComplete="off" />
              <TextField label="Meta description" value={meta.seo_meta_description ?? ""} onChange={(v) => updateMeta("seo_meta_description", v)} placeholder="Meta description" multiline={2} />
              <TextField label="Keywords" value={meta.seo_keywords ?? ""} onChange={(v) => updateMeta("seo_keywords", v)} placeholder="keyword1, keyword2" autoComplete="off" />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="300">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="bodyMd" fontWeight="regular">Status</Text>
                <Select label="Status" labelHidden options={STATUS_OPTIONS} value={product.status || "draft"} onChange={(v) => update({ status: v })} />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="bodyMd" fontWeight="regular">Collections</Text>
                <ChoiceList
                  title=""
                  titleHidden
                  allowMultiple
                  choices={(collections || []).map((c) => ({ label: c.title || c.handle || c.id, value: c.id }))}
                  selected={collectionIds}
                  onChange={(v) => updateMeta("collection_ids", v)}
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="bodyMd" fontWeight="regular">Sales</Text>
                <Text as="p" variant="bodyMd">{meta.sales_count != null ? meta.sales_count : 0} sales</Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="bodyMd" fontWeight="regular">Type</Text>
                <TextField label="Product type" labelHidden value={meta.type ?? ""} onChange={(v) => updateMeta("type", v)} placeholder="e.g. T-Shirt" autoComplete="off" />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="bodyMd" fontWeight="regular">Weight & dimensions</Text>
                <TextField label="Weight (g)" labelHidden type="number" value={meta.weight_grams != null ? String(meta.weight_grams) : ""} onChange={(v) => updateMeta("weight_grams", v === "" ? "" : parseInt(v, 10))} placeholder="grams" />
                <InlineStack gap="200">
                  <TextField label="L (cm)" labelHidden type="number" value={meta.dimensions_length != null ? String(meta.dimensions_length) : ""} onChange={(v) => updateMeta("dimensions_length", v)} placeholder="L" />
                  <TextField label="W (cm)" labelHidden type="number" value={meta.dimensions_width != null ? String(meta.dimensions_width) : ""} onChange={(v) => updateMeta("dimensions_width", v)} placeholder="W" />
                  <TextField label="H (cm)" labelHidden type="number" value={meta.dimensions_height != null ? String(meta.dimensions_height) : ""} onChange={(v) => updateMeta("dimensions_height", v)} placeholder="H" />
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="bodyMd" fontWeight="regular">Content / unit</Text>
                <Text as="p" variant="bodySm" tone="subdued">e.g. 200 g, 1 piece → Display: Content: 200 g (€5.00* / 1 kg)</Text>
                <TextField label="Value (e.g. 200)" labelHidden type="number" value={meta.unit_value != null ? String(meta.unit_value) : ""} onChange={(v) => updateMeta("unit_value", v)} placeholder="200" />
                <Select label="Unit" labelHidden options={UNIT_TYPE_OPTIONS} value={meta.unit_type ?? ""} onChange={(v) => updateMeta("unit_type", v)} />
                <TextField label="Reference (e.g. 1 for 1 kg)" labelHidden type="number" value={meta.unit_reference != null ? String(meta.unit_reference) : "1"} onChange={(v) => updateMeta("unit_reference", v)} placeholder="1" />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {deleteConfirmOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setDeleteConfirmOpen(false)}>
          <div style={{ background: "var(--p-color-bg-surface)", padding: 24, borderRadius: 12, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <Text as="p" variant="bodyMd">Delete "{product.title}"?</Text>
            <InlineStack gap="200" blockAlign="end">
              <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
              <Button variant="primary" tone="critical" onClick={() => { setDeleteConfirmOpen(false); deleteProduct(); }}>Delete</Button>
            </InlineStack>
          </div>
        </div>
      )}
    </Page>
  );
}
