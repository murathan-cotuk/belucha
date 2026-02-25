"use client";

import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { tokens } from "@/design-system/tokens";
import { ProductCard } from "@/components/ProductCard";

const Section = styled.section`
  padding: ${tokens.sectionGap} ${tokens.containerPadding};
  max-width: 1280px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-family: ${tokens.fontFamily.sans};
  font-size: ${tokens.fontSize.h2};
  font-weight: 600;
  color: ${tokens.dark[900]};
  margin-bottom: ${tokens.spacing.xl};
`;

const Scroll = styled(motion.div)`
  display: flex;
  gap: ${tokens.spacing.lg};
  overflow-x: auto;
  padding-bottom: ${tokens.spacing.md};
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  & > * {
    flex-shrink: 0;
    scroll-snap-align: start;
  }
`;

export default function RecommendCarousel({
  title = "Beliebt bei unseren Kunden",
  products = [],
}) {
  return (
    <Section>
      <Title>{title}</Title>
      <Scroll>
        {(products || []).slice(0, 12).map((product, i) => (
          <motion.div
            key={product.id || i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            style={{ width: 280 }}
          >
            <ProductCard product={product} compact />
          </motion.div>
        ))}
      </Scroll>
    </Section>
  );
}
