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

export default function CategoryTemplate() {
  const params = useParams();
  const slug = params?.slug;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const client = getMedusaClient();
        // Medusa doesn't have categories by default, filter by collection or handle
        const result = await client.getProducts({ collection_id: slug });
        setProducts(result.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProducts();
    }
  }, [slug]);

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (error) {
    return <Container>Error: {error}</Container>;
  }

  return (
    <Container>
      <CategoryHeader>
        <CategoryTitle>Category: {slug}</Title>
      </CategoryHeader>
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

