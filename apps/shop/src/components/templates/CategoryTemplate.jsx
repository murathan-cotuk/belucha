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
  & p { margin-bottom: 1em; }
  & h2, & h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
  & ul, & ol { margin-left: 1.5em; }
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

