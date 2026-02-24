"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";

const Bar = styled.div`
  background-color: #0f172a;
  color: #94a3b8;
  padding: 10px 0;
  font-size: 13px;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
`;

const Item = styled(Link)`
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
`;

const DEFAULT_ITEMS = [
  { text: "Kostenloser Versand ab 50 €", href: "/shipping" },
  { text: "Kontakt", href: "/contact" },
  { text: "Retouren & Umtausch", href: "/returns" },
  { text: "Sicher einkaufen", href: "/secure" },
];

export default function TopBar({ items = DEFAULT_ITEMS }) {
  return (
    <Bar>
      <Container>
        {items.slice(0, 4).map((item, i) => (
          <Item key={i} href={item.href || "#"}>{item.text}</Item>
        ))}
      </Container>
    </Bar>
  );
}
