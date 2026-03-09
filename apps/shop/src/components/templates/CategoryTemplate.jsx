"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { getMedusaClient } from "@/lib/medusa-client";
import { ProductGrid } from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px;
`;

const CategoryHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const CategoryTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1f2937;
`;

const CategoryDescription = styled.p`
  font-size: 18px;
  color: #6b7280;
  max-width: 800px;
  margin: 0 auto;
`;

const BannerImage = styled.img`
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const LongContent = styled.div`
  max-width: 800px;
  margin: 0 auto 48px;
  color: #4b5563;
  line-height: 1.6;
  font-size: 1rem;

  & h1 { font-size: 1.75rem; font-weight: 700; margin: 1.25em 0 0.5em; color: #1f2937; line-height: 1.3; }
  & h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25em 0 0.5em; color: #1f2937; line-height: 1.3; }
  & h3 { font-size: 1.25rem; font-weight: 600; margin: 1em 0 0.4em; color: #1f2937; line-height: 1.35; }
  & h4, & h5, & h6 { font-size: 1.125rem; font-weight: 600; margin: 0.85em 0 0.35em; color: #374151; line-height: 1.4; }
  & h1:first-child, & h2:first-child, & h3:first-child { margin-top: 0; }
  & p { margin: 0 0 1em; }
  & p:last-child { margin-bottom: 0; }
  & ul, & ol { margin: 0.5em 0 1em 1.5em; padding-left: 1.5em; }
  & ul { list-style-type: disc; }
  & ol { list-style-type: decimal; }
  & li { margin-bottom: 0.35em; }
  & strong { font-weight: 600; color: #374151; }
  & em { font-style: italic; }
  & a { color: #0ea5e9; text-decoration: underline; }
  & a:hover { text-decoration: none; }
  & blockquote { margin: 1em 0; padding-left: 1em; border-left: 4px solid #e5e7eb; color: #6b7280; }
  & hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.25em 0; }
`;

function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\s*on\w+=["'][^"']*["']/gi, "");
}

export default function CategoryTemplate() {
  const params = useParams();
  const slug = params?.slug;
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const client = getMedusaClient();
        const cat = await client.getCategoryBySlug(slug).catch(() => null);
        setCategory(cat || null);
        const result = await client.getProducts({ category: slug });
        setProducts(result.products || []);
      } catch (err) {
        setError(err?.message || "Failed to load category");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "48px", color: "#6b7280" }}>Loading category…</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ padding: "24px", backgroundColor: "#fef2f2", borderRadius: "8px", color: "#991b1b" }}>{error}</div>
      </Container>
    );
  }

  const title = category?.name || (slug ? `Category: ${slug}` : "Category");
  const safeLongContent = category?.long_content ? sanitizeHtml(category.long_content) : "";

  return (
    <Container>
      <Breadcrumbs title={title} />
      {category?.banner_image_url && (
        <BannerImage src={category.banner_image_url} alt={title} />
      )}
      <CategoryHeader>
        <CategoryTitle>{title}</CategoryTitle>
        {category?.description && <CategoryDescription>{category.description}</CategoryDescription>}
      </CategoryHeader>
      {safeLongContent && (
        <LongContent dangerouslySetInnerHTML={{ __html: safeLongContent }} />
      )}
      <ProductGrid products={products} />
    </Container>
  );
}

