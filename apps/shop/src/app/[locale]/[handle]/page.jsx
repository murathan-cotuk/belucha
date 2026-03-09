"use client";

import ShopHeader from "@/components/ShopHeader";
import Footer from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { getMedusaClient } from "@/lib/medusa-client";
import { tokens } from "@/design-system/tokens";
import styled from "styled-components";

const RESERVED_HANDLES = ["search", "login", "register", "account", "bestsellers", "recommended", "category", "pages", "collections", "produkt", "kollektion", "product"];

/** Resolve collection/category handle from menu item link_value for matching. */
function getHandleFromMenuItem(item) {
  if (!item) return null;
  const raw = item.link_value;
  if (raw == null) return null;
  const str = typeof raw === "string" ? raw.trim() : String(raw);
  if (item.link_type === "collection" || item.link_type === "category") {
    if (str.startsWith("{")) {
      try {
        const p = JSON.parse(str);
        return p.handle || p.slug || p.id || null;
      } catch {
        return null;
      }
    }
    return str || null;
  }
  if (item.link_type === "url" && str) {
    const path = str.startsWith("http") ? new URL(str).pathname : str;
    const segment = path.replace(/^\/+|\/+$/g, "").split("/").pop();
    return segment || null;
  }
  return null;
}

/** Flatten menu items (root + nested items) for scanning. */
function flattenMenuItems(items) {
  if (!Array.isArray(items)) return [];
  const out = [];
  for (const item of items) {
    out.push(item);
    if (Array.isArray(item.items) && item.items.length) out.push(...flattenMenuItems(item.items));
  }
  return out;
}

/** Find menu label for a collection handle from store menus. */
function findMenuLabelForHandle(menuData, handle) {
  if (!handle || !menuData?.menus) return null;
  const norm = (s) => String(s || "").toLowerCase().trim();
  for (const menu of menuData.menus) {
    const all = flattenMenuItems(menu?.items || []);
    for (const item of all) {
      const itemHandle = getHandleFromMenuItem(item);
      if (itemHandle && norm(itemHandle) === norm(handle)) return item.label || null;
    }
  }
  return null;
}

function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\s*on\w+=["'][^"']*["']/gi, "");
}

const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${tokens.background.main};
`;

const Main = styled.main`
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 0 ${tokens.containerPadding} ${tokens.sectionGap};
`;

const Banner = styled.div`
  width: 100%;
  margin-bottom: ${tokens.spacing.xl};
  border-radius: ${tokens.radius.card};
  overflow: hidden;
  background: ${tokens.background.soft};
  img {
    width: 100%;
    height: auto;
    max-height: 280px;
    object-fit: cover;
    display: block;
  }
`;

const Title = styled.h1`
  font-size: ${tokens.fontSize.h2};
  font-weight: 700;
  color: ${tokens.dark[900]};
  margin: 0 0 ${tokens.spacing.md};
  font-family: ${tokens.fontFamily.sans};
`;

const Description = styled.div`
  font-size: ${tokens.fontSize.body};
  line-height: ${tokens.lineHeight.relaxed};
  color: ${tokens.dark[600]};
  margin-top: ${tokens.spacing["2xl"]};
  margin-bottom: ${tokens.spacing.xl};
  max-width: 720px;

  & h1 { font-size: 1.75rem; font-weight: 700; margin: 1.25em 0 0.5em; color: ${tokens.dark[800]}; line-height: 1.3; }
  & h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25em 0 0.5em; color: ${tokens.dark[800]}; line-height: 1.3; }
  & h3 { font-size: 1.25rem; font-weight: 600; margin: 1em 0 0.4em; color: ${tokens.dark[800]}; line-height: 1.35; }
  & h4, & h5, & h6 { font-size: 1.125rem; font-weight: 600; margin: 0.85em 0 0.35em; color: ${tokens.dark[700]}; line-height: 1.4; }
  & h1:first-child, & h2:first-child, & h3:first-child { margin-top: 0; }
  & p { margin: 0 0 0.75em; }
  & p:last-child { margin-bottom: 0; }
  & ul, & ol { margin: 0.5em 0 1em 1.5em; padding-left: 1.5em; }
  & ul { list-style-type: disc; }
  & ol { list-style-type: decimal; }
  & li { margin-bottom: 0.35em; }
  & strong { font-weight: 600; color: ${tokens.dark[700]}; }
  & em { font-style: italic; }
  & a { color: ${tokens.primary.DEFAULT}; text-decoration: underline; }
  & a:hover { text-decoration: none; }
  & blockquote { margin: 1em 0; padding-left: 1em; border-left: 4px solid ${tokens.border.light}; color: ${tokens.dark[500]}; }
  & hr { border: none; border-top: 1px solid ${tokens.border.light}; margin: 1.25em 0; }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${tokens.spacing.md};
  margin-bottom: ${tokens.spacing.lg};
`;

const SortSelect = styled.select`
  padding: ${tokens.spacing.sm} ${tokens.spacing.md};
  border: 1px solid ${tokens.border.light};
  border-radius: ${tokens.radius.input};
  font-size: ${tokens.fontSize.small};
  font-family: ${tokens.fontFamily.sans};
  background: ${tokens.background.card};
  color: ${tokens.dark[800]};
`;

const EmptyState = styled.p`
  text-align: center;
  color: ${tokens.dark[500]};
  font-size: ${tokens.fontSize.body};
  padding: ${tokens.spacing["2xl"]} ${tokens.spacing.md};
  margin: 0;
`;

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: ${tokens.spacing.md};
  border-radius: ${tokens.radius.input};
  margin: ${tokens.spacing.xl} 0;
`;

const SORT_OPTIONS = [
  { value: "default", label: "Standard" },
  { value: "price_asc", label: "Preis aufsteigend" },
  { value: "price_desc", label: "Preis absteigend" },
  { value: "title_asc", label: "Name A–Z" },
  { value: "title_desc", label: "Name Z–A" },
];

const PER_PAGE = 24;

export default function CollectionByHandlePage() {
  const params = useParams();
  const locale = params?.locale ?? "en";
  const handle = params?.handle != null ? String(params.handle) : undefined;

  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [notFoundState, setNotFoundState] = useState(false);
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    let applied = false;
    const apply = (data) => {
      if (applied || !data?.menus?.length) return;
      applied = true;
      setMenuData(data);
    };
    fetch("/api/store-menus")
      .then((r) => r.json())
      .then(apply)
      .catch(() => {});
    getMedusaClient()
      .getMenus()
      .then(apply)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!handle) return;
    if (RESERVED_HANDLES.includes(handle.toLowerCase())) {
      setNotFoundState(true);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const client = getMedusaClient();
        const colRes = await client.getCollectionByHandle(handle);
        const col = colRes?.collection ?? null;
        if (!col) {
          setNotFoundState(true);
          setCollection(null);
          setProducts([]);
          setLoading(false);
          return;
        }
        setCollection(col);
        const productsRes = await client.getProducts({
          collection_id: col.id,
          limit: 200,
        });
        setProducts(productsRes?.products ?? []);
      } catch (err) {
        setError(err?.message ?? "Fehler beim Laden");
        setCollection(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle]);

  useEffect(() => {
    if (typeof document === "undefined" || !collection?.handle) return;
    const href = `${window.location.origin}/${locale}/${collection.handle}`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [locale, collection?.handle]);

  const sortedProducts = [...(products || [])];
  if (sort === "price_asc") sortedProducts.sort((a, b) => (a.variants?.[0]?.prices?.[0]?.amount ?? 0) - (b.variants?.[0]?.prices?.[0]?.amount ?? 0));
  if (sort === "price_desc") sortedProducts.sort((a, b) => (b.variants?.[0]?.prices?.[0]?.amount ?? 0) - (a.variants?.[0]?.prices?.[0]?.amount ?? 0));
  if (sort === "title_asc") sortedProducts.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  if (sort === "title_desc") sortedProducts.sort((a, b) => (b.title || "").localeCompare(a.title || ""));

  const total = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const paginatedProducts = sortedProducts.slice(start, start + PER_PAGE);

  const menuLabel = findMenuLabelForHandle(menuData, collection?.handle);
  const breadcrumbLabel = (menuLabel || "").trim() || (collection?.display_title || collection?.title || "").trim() || handle;
  const pageTitle = (collection?.display_title || collection?.title || "").trim() || handle;

  if (notFoundState) notFound();

  if (loading) {
    return (
      <PageWrap>
        <ShopHeader />
        <Main>
          <p>Laden…</p>
        </Main>
        <Footer />
      </PageWrap>
    );
  }

  if (error || !collection) {
    return (
      <PageWrap>
        <ShopHeader />
        <Main>
          <ErrorBox>{error || "Kollektion nicht gefunden"}</ErrorBox>
        </Main>
        <Footer />
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <ShopHeader />
      <Main>
        <Breadcrumbs items={[{ label: "Home", href: `/${locale}` }, { label: breadcrumbLabel, href: null }]} />
        {collection.banner && (
          <Banner>
            <img src={collection.banner} alt="" />
          </Banner>
        )}
        <Title>{pageTitle}</Title>

        <Toolbar>
          <span style={{ fontSize: tokens.fontSize.small, color: tokens.dark[500] }}>
            {total} {total === 1 ? "Produkt" : "Produkte"}
          </span>
          <SortSelect value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sortierung">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </SortSelect>
        </Toolbar>

        {paginatedProducts.length === 0 ? (
          <EmptyState>Noch keine Produkte in dieser Kollektion.</EmptyState>
        ) : (
          <>
            <ProductGrid products={paginatedProducts} />
            {totalPages > 1 && (
              <div style={{ marginTop: tokens.spacing.xl, display: "flex", justifyContent: "center", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                    border: `1px solid ${tokens.border.light}`,
                    borderRadius: tokens.radius.button,
                    background: tokens.background.card,
                    cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                    opacity: currentPage <= 1 ? 0.6 : 1,
                  }}
                >
                  Zurück
                </button>
                <span style={{ alignSelf: "center", fontSize: tokens.fontSize.small, color: tokens.dark[500] }}>
                  Seite {currentPage} von {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                    border: `1px solid ${tokens.border.light}`,
                    borderRadius: tokens.radius.button,
                    background: tokens.background.card,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                    opacity: currentPage >= totalPages ? 0.6 : 1,
                  }}
                >
                  Weiter
                </button>
              </div>
            )}
          </>
        )}

        {collection.description && (
          <Description
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(collection.description),
            }}
          />
        )}
      </Main>
      <Footer />
    </PageWrap>
  );
}
