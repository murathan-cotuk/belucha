"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Banner,
  SkeletonBodyText,
  SkeletonDisplayText,
  Divider,
} from "@shopify/polaris";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const medusaClient = getMedusaAdminClient();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await medusaClient.getAdminHubProducts();
        setProducts(data.products || []);
      } catch (err) {
        setError(err?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Page title="Inventory">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={3} />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Inventory"
      primaryAction={{
        content: "Add product",
        onAction: () => router.push("/products/new"),
      }}
      secondaryActions={[
        { content: "Bulk upload", url: "/products/bulk-upload" },
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
                  All products
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {products.length} {products.length === 1 ? "product" : "products"}
                </Text>
              </InlineStack>
              <Divider />

              {products.length === 0 ? (
                <Box paddingBlock="400">
                  <BlockStack gap="300">
                    <Text as="p" tone="subdued">
                      No products yet. Add your first product to get started.
                    </Text>
                    <InlineStack gap="200">
                      <Button variant="primary" url="/products/new">
                        Add product
                      </Button>
                      <Button url="/products/bulk-upload">Bulk upload</Button>
                    </InlineStack>
                  </BlockStack>
                </Box>
              ) : (
                <BlockStack gap="200">
                  {products.map((product) => {
                    const meta = product.metadata && typeof product.metadata === "object" ? product.metadata : {};
                    const media = meta.media;
                    const thumbUrl = Array.isArray(media) && media[0] ? media[0] : (typeof media === "string" && media ? media : null);
                    const price = product.price != null ? Number(product.price) : (product.variants?.[0]?.prices?.[0]?.amount ? Number(product.variants[0].prices[0].amount) / 100 : 0);
                    const inv = product.inventory != null ? Number(product.inventory) : 0;
                    const sku = product.sku || "—";
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.handle || product.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Box
                          padding="300"
                          background="bg-surface-secondary"
                          borderRadius="200"
                        >
                          <InlineStack align="space-between" blockAlign="center" gap="400">
                            <InlineStack gap="300" blockAlign="center" wrap={false}>
                              <Box
                                minWidth="56px"
                                width="56px"
                                minHeight="56px"
                                height="56px"
                                background="bg-fill-secondary"
                                borderRadius="200"
                                overflow="hidden"
                              >
                                {thumbUrl ? (
                                  <img
                                    src={thumbUrl}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                  />
                                ) : null}
                              </Box>
                              <BlockStack gap="100">
                                <Text as="p" variant="bodyMd" fontWeight="medium">
                                  {product.title || "Untitled"}
                                </Text>
                                <InlineStack gap="200" wrap>
                                  <Text as="span" variant="bodySm" tone="subdued">
                                    SKU: {sku}
                                  </Text>
                                  <Text as="span" variant="bodySm" tone="subdued">
                                    · Qty: {inv}
                                  </Text>
                                  <Text as="span" variant="bodySm" tone="subdued">
                                    · €{price.toFixed(2)}
                                  </Text>
                                  <Text as="span" variant="bodySm" tone="subdued">
                                    · {product.status || "draft"}
                                  </Text>
                                </InlineStack>
                              </BlockStack>
                            </InlineStack>
                            <Text as="span" variant="bodySm" tone="subdued">
                              View
                            </Text>
                          </InlineStack>
                        </Box>
                      </Link>
                    );
                  })}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
