"use client";

import ShopHeader from "@/components/ShopHeader";
import Footer from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Link } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { tokens } from "@/design-system/tokens";
import { resolveImageUrl } from "@/lib/image-url";
import styled from "styled-components";

const RESERVED_HANDLES = ["search", "login", "register", "account", "bestsellers", "recommended", "category", "pages", "collections", "produkt", "kollektion", "product"];

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
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const ContentRow = styled.div`
  display: flex;
  width: 100%;
  margin: 0;
  flex: 1;
`;

const FilterSidebar = styled.aside`
  width: 260px;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 72px;
  bottom: 0;
  padding: 20px 16px 48px 20px;
  border-right: 2px solid #000;
  background: #fff;
  overflow-y: auto;
  z-index: 10;
`;

const ContentColumn = styled.div`
  flex: 1;
  min-width: 0;
  padding: 20px 24px 48px 32px;
  margin-left: 260px;
  max-width: 1280px;
`;

const FilterTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.02em;
  margin-bottom: 10px;
  margin-top: 20px;
`;

const FilterList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const FilterItem = styled.li`
  margin: 0;
  padding: 0;
`;

const FilterLink = styled(Link)`
  display: block;
  padding: 10px 12px;
  font-size: 15px;
  color: ${(p) => (p.$active ? "#111827" : "#4b5563")};
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  text-decoration: none;
  border-radius: 8px;
  background: ${(p) => (p.$active ? "#e5e7eb" : "transparent")};
  margin-bottom: 2px;
  &:hover {
    background: #e5e7eb;
    color: #111827;
  }
`;

const BannerWrap = styled.div`
  width: 100%;
  margin-bottom: 0;
  flex-shrink: 0;
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

const HEADING_ORANGE = "#c2410c";

const Title = styled.h1`
  font-size: ${tokens.fontSize.h2};
  font-weight: 700;
  color: ${HEADING_ORANGE};
  margin: 0 0 ${tokens.spacing.md};
  font-family: ${tokens.fontFamily.sans};
`;

const Description = styled.div`
  font-size: ${tokens.fontSize.body};
  line-height: ${tokens.lineHeight.relaxed};
  color: ${tokens.dark[600]};
  margin-top: ${tokens.spacing["2xl"]};
  margin-bottom: ${tokens.spacing.xl};
  width: 100%;
  max-width: 100%;
  border: 1px solid #000;
  border-radius: ${tokens.radius.card};
  padding: ${tokens.spacing.lg};
  & h1 { font-size: 1.75rem; font-weight: 700; margin: 1.25em 0 0.5em; color: ${HEADING_ORANGE}; line-height: 1.3; }
  & h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25em 0 0.5em; color: ${HEADING_ORANGE}; line-height: 1.3; }
  & h3 { font-size: 1.25rem; font-weight: 600; margin: 1em 0 0.4em; color: ${HEADING_ORANGE}; line-height: 1.35; }
  & h4, & h5, & h6 { font-size: 1.125rem; font-weight: 600; margin: 0.85em 0 0.35em; color: ${HEADING_ORANGE}; line-height: 1.4; }
  & h1:first-child, & h2:first-child, & h3:first-child { margin-top: 0; }
  & p { margin: 0 0 0.75em; }
  & p:last-child { margin-bottom: 0; }
  & ul, & ol { margin: 0.5em 0 1em 1.5em; padding-left: 1.5em; }
  & ul { list-style-type: disc; }
  & ol { list-style-type: decimal; }
  & li { margin-bottom: 0.35em; }
  & strong { font-weight: 600; }
  & a { color: #0ea5e9; text-decoration: underline; }
  & blockquote { margin: 1em 0; padding-left: 1em; border-left: 4px solid #e5e7eb; color: #6b7280; }
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
  const [allCollections, setAllCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [notFoundState, setNotFoundState] = useState(false);
  const [metadataFilters, setMetadataFilters] = useState({});

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

        const colRes = await fetch(`/api/store-collections?handle=${encodeURIComponent(handle)}`);
        if (colRes.status === 404) {
          setNotFoundState(true);
          setCollection(null);
          setProducts([]);
          setLoading(false);
          return;
        }
        if (!colRes.ok) {
          throw new Error(`HTTP ${colRes.status}`);
        }
        const colData = await colRes.json();
        const col = colData?.collection ?? null;
        if (!col) {
          setNotFoundState(true);
          setCollection(null);
          setProducts([]);
          setLoading(false);
          return;
        }
        setCollection(col);

        const params = new URLSearchParams({ limit: "200" });
        if (col.id) params.set("collection_id", String(col.id));
        if (col.handle) params.set("collection_handle", String(col.handle));
        const [productsRes, listRes] = await Promise.all([
          fetch(`/api/store-products?${params.toString()}`).then((r) => r.json()).catch(() => ({ products: [] })),
          fetch("/api/store-collections").then((r) => r.json()).catch(() => ({ collections: [] })),
        ]);
        setProducts(productsRes?.products ?? []);
        setAllCollections(listRes?.collections ?? []);
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

  const metadataFacets = (() => {
    const facets = {};
    (products || []).forEach((p) => {
      const meta = p.metadata && typeof p.metadata === "object" ? p.metadata : {};
      Object.entries(meta).forEach(([key, value]) => {
        if (key === "media" || key === "image_url" || key === "image") return;
        if (!facets[key]) facets[key] = new Set();
        if (Array.isArray(value)) value.forEach((x) => { const s = String(x).trim(); if (s) facets[key].add(s); });
        else if (value != null) { const v = String(value).trim(); if (v) facets[key].add(v); }
      });
    });
    return Object.fromEntries(Object.entries(facets).map(([k, s]) => [k, [...s].filter(Boolean).sort()]));
  })();

  let filteredProducts = [...(products || [])];
  Object.entries(metadataFilters).forEach(([key, selectedValues]) => {
    if (!selectedValues?.length) return;
    filteredProducts = filteredProducts.filter((p) => {
      const meta = p.metadata && typeof p.metadata === "object" ? p.metadata : {};
      const val = meta[key];
      if (val == null) return false;
      const arr = Array.isArray(val) ? val : [val];
      return arr.some((v) => selectedValues.includes(String(v).trim()));
    });
  });

  const sortedProducts = [...filteredProducts];
  if (sort === "price_asc") sortedProducts.sort((a, b) => (a.variants?.[0]?.prices?.[0]?.amount ?? 0) - (b.variants?.[0]?.prices?.[0]?.amount ?? 0));
  if (sort === "price_desc") sortedProducts.sort((a, b) => (b.variants?.[0]?.prices?.[0]?.amount ?? 0) - (a.variants?.[0]?.prices?.[0]?.amount ?? 0));
  if (sort === "title_asc") sortedProducts.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  if (sort === "title_desc") sortedProducts.sort((a, b) => (b.title || "").localeCompare(a.title || ""));

  const total = sortedProducts.length;

  const toggleMetadataFilter = (key, value) => {
    setMetadataFilters((prev) => {
      const current = prev[key] || [];
      const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
      return next.length ? { ...prev, [key]: next } : (() => { const u = { ...prev }; delete u[key]; return u; })();
    });
    setPage(1);
  };
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const paginatedProducts = sortedProducts.slice(start, start + PER_PAGE);

  const displayTitle = collection?.display_title || collection?.title || "";

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
        {collection.banner && (
          <BannerWrap>
            <Banner>
              <img src={resolveImageUrl(collection.banner)} alt="" />
            </Banner>
          </BannerWrap>
        )}
        <ContentRow>
          <FilterSidebar>
            <FilterTitle>Sortierung</FilterTitle>
            <SortSelect
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sortierung"
              style={{ width: "100%", marginBottom: 24 }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </SortSelect>
            {Object.entries(metadataFacets).map(([key, values]) =>
              values.length > 0 ? (
                <div key={key}>
                  <FilterTitle>{key.replace(/_/g, " ")}</FilterTitle>
                  <FilterList>
                    {values.map((value) => {
                      const selected = (metadataFilters[key] || []).includes(value);
                      return (
                        <FilterItem key={value}>
                          <button
                            type="button"
                            onClick={() => toggleMetadataFilter(key, value)}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 12px",
                              fontSize: 14,
                              color: selected ? "#111827" : "#4b5563",
                              fontWeight: selected ? 600 : 400,
                              background: selected ? "#e5e7eb" : "transparent",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            {value}
                          </button>
                        </FilterItem>
                      );
                    })}
                  </FilterList>
                </div>
              ) : null
            )}
          </FilterSidebar>
          <ContentColumn>
            <Breadcrumbs items={[{ label: "Home", href: `/${locale}` }, { label: displayTitle || handle, href: null }]} />
            <Title>{displayTitle}</Title>
            <div style={{ fontSize: tokens.fontSize.small, color: tokens.dark[500], marginBottom: tokens.spacing.lg }}>
              {total} {total === 1 ? "Produkt" : "Produkte"}
            </div>

            {paginatedProducts.length === 0 ? (
              <EmptyState>Noch keine Produkte in dieser Kollektion.</EmptyState>
            ) : (
              <>
                <ProductGrid products={paginatedProducts} maxColumns={3} />
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
          </ContentColumn>
        </ContentRow>
      </Main>
      <Footer />
    </PageWrap>
  );
}
