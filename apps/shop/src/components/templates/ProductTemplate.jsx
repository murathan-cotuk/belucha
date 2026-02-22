"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { Button, Card } from "@belucha/ui";
import { getMedusaClient } from "@/lib/medusa-client";
import { useMedusaCart } from "@/hooks/useMedusa";

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px;
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageGallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MainImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  background-color: #f3f4f6;
`;

const Thumbnails = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #0ea5e9;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Price = styled.span`
  font-size: 36px;
  font-weight: 700;
  color: #0ea5e9;
`;

const ComparePrice = styled.span`
  font-size: 24px;
  color: #9ca3af;
  text-decoration: line-through;
`;

function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\s*on\w+=["'][^"']*["']/gi, "");
}

const Description = styled.div`
  color: #4b5563;
  line-height: 1.6;
  & p { margin-bottom: 1em; }
  & ul, & ol { margin-left: 1.5em; }
  & strong { font-weight: 600; }
  & a { color: #0ea5e9; text-decoration: underline; }
`;

const Actions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

const SellerInfo = styled(Card)`
  margin-top: 24px;
`;

export default function ProductTemplate() {
  const params = useParams();
  const slug = params?.slug;
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useMedusaCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const client = getMedusaClient();
        // Medusa uses handle or id, try handle first
        const result = await client.getProduct(slug);
        setProduct(result.product);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container>Error: {error}</Container>;
  if (!product) return <Container>Product not found</Container>;

  const images = product.images || [];
  const mainImage = images[selectedImage]?.url || product.thumbnail || "https://via.placeholder.com/600";

  return (
    <Container>
      <ProductContainer>
        <ImageGallery>
          <MainImage src={mainImage} alt={product.title} />
          {images.length > 1 && (
            <Thumbnails>
              {images.map((img, index) => (
                <Thumbnail
                  key={index}
                  src={img.url || "https://via.placeholder.com/80"}
                  alt={img.alt || product.title}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </Thumbnails>
          )}
        </ImageGallery>
        <ProductInfo>
          <Title>{product.title}</Title>
          <PriceContainer>
            <Price>${product.variants?.[0]?.prices?.[0]?.amount ? (product.variants[0].prices[0].amount / 100).toFixed(2) : '0.00'}</Price>
          </PriceContainer>
          <Description
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(product.description || product.subtitle || "") || "No description available",
            }}
          />
          <Actions>
            <Button 
              size="lg" 
              fullWidth
              onClick={() => {
                const variantId = product.variants?.[0]?.id;
                if (variantId) {
                  addToCart(variantId, 1);
                }
              }}
            >
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" fullWidth>
              Buy Now
            </Button>
          </Actions>
          <SellerInfo>
            <p>
              <strong>Product ID:</strong> {product.id}
            </p>
            {product.collection && (
              <p>
                <strong>Collection:</strong> {product.collection.title}
              </p>
            )}
            {product.variants?.[0]?.inventory_quantity !== undefined && (
              <p>
                <strong>Stock:</strong> {product.variants[0].inventory_quantity} available
              </p>
            )}
          </SellerInfo>
        </ProductInfo>
      </ProductContainer>
    </Container>
  );
}

