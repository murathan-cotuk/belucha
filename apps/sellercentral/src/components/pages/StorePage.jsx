"use client";

import React, { useState } from "react";
import {
  Page,
  Card,
  Button,
  TextField,
  Text,
  BlockStack,
  InlineStack,
  Box,
} from "@shopify/polaris";

const templates = [
  { id: "modern", name: "Modern Store", description: "Clean and contemporary design with focus on product showcase" },
  { id: "classic", name: "Classic Store", description: "Traditional layout with emphasis on brand storytelling" },
  { id: "minimal", name: "Minimal Store", description: "Simple and elegant design with minimal distractions" },
];

export default function StorePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");

  return (
    <Page title="Create your store" backAction={{ content: "Back", url: "/" }}>
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Store information
            </Text>
            <BlockStack gap="300">
              <TextField
                label="Store name"
                value={storeName}
                onChange={setStoreName}
                placeholder="My Awesome Store"
                autoComplete="off"
              />
              <TextField
                label="Store URL slug"
                value={storeSlug}
                onChange={setStoreSlug}
                placeholder="my-awesome-store"
                autoComplete="off"
              />
            </BlockStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Choose a template
            </Text>
            <Text as="p" tone="subdued">
              Select a template for your store landing page (similar to Amazon Stores).
            </Text>
            <InlineStack gap="300" wrap>
              {templates.map((template) => (
                <Box
                  key={template.id}
                  minWidth="280px"
                  padding="400"
                  background={selectedTemplate === template.id ? "bg-surface-selected" : "bg-surface"}
                  borderRadius="200"
                  borderWidth="025"
                  borderColor={selectedTemplate === template.id ? "border-brand" : "border"}
                  cursor="pointer"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <BlockStack gap="200">
                    <Box minHeight="120px" background="bg-fill-info" borderRadius="200" padding="400" />
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {template.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {template.description}
                    </Text>
                  </BlockStack>
                </Box>
              ))}
            </InlineStack>
            {selectedTemplate && (
              <Button variant="primary">
                Create store with {templates.find((t) => t.id === selectedTemplate)?.name} template
              </Button>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
