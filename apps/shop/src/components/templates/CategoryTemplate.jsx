"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@belucha/ui";
import { getMedusaClient } from "@/lib/medusa-client";

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px;
`;

const CategoryHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const CategoryImage = styled.img`
  width: 100%;
  max-width: 600px;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 24px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const ProductCard = styled(Card)`
  overflow: hidden;
  padding: 0;
`;

const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background-color: #f3f4f6;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  padding: 16px;
`;

const ProductTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
`;

const SellerName = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Price = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #0ea5e9;
`;

const ComparePrice = styled.span`
  font-size: 16px;
  color: #9ca3af;
  text-decoration: line-through;
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
      <Grid>
        {products.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px", color: "#6b7280" }}>
            No products found in this category
          </div>
        ) : (
          products.map((product) => (
            <Link key={product.id} href={`/product/${product.handle || product.id}`}>
              <ProductCard hover>
                <ImageWrapper>
                  <ProductImage
                    src={
                      product.images?.[0]?.url ||
                      product.thumbnail ||
                      "https://via.placeholder.com/400"
                    }
                    alt={product.title}
                  />
                </ImageWrapper>
                <ProductInfo>
                  <ProductTitle>{product.title}</ProductTitle>
                  <PriceContainer>
                    <Price>${product.variants?.[0]?.prices?.[0]?.amount ? (product.variants[0].prices[0].amount / 100).toFixed(2) : '0.00'}</Price>
                  </PriceContainer>
                </ProductInfo>
              </ProductCard>
            </Link>
          ))
        )}
      </Grid>
    </Container>
  );
}

