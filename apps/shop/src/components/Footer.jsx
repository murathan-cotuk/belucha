"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getMedusaClient } from "@/lib/medusa-client";

function menuItemHref(item) {
  if (!item) return "#";
  if (item.link_type === "url" && item.link_value) return item.link_value.startsWith("http") ? item.link_value : `/${item.link_value.replace(/^\//, "")}`;
  if ((item.link_type === "category" || item.link_type === "collection") && item.link_value) return `/collections/${item.link_value}`;
  if (item.link_type === "page" && item.link_value) return `/pages/${item.link_value}`;
  if (item.link_type === "product" && item.link_value) return `/product/${item.link_value}`;
  return item.link_value ? `/${String(item.link_value).replace(/^\//, "")}` : "#";
}

const FooterContainer = styled.footer`
  background-color: #1f2937;
  color: white;
  padding: 48px 0 24px;
  margin-top: auto;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$columns || 4}, 1fr);
  gap: 32px;
  margin-bottom: 32px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #f1f5f9;
`;

const FooterLink = styled(Link)`
  color: #9ca3af;
  font-size: 14px;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
`;

const Placeholder = styled.div`
  color: #64748b;
  font-size: 14px;
`;

const LogoPlaceholder = styled(Link)`
  color: #0ea5e9;
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;

  &:hover {
    color: #38bdf8;
  }
`;

const Bottom = styled.div`
  border-top: 1px solid #374151;
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const Copyright = styled.p`
  color: #9ca3af;
  font-size: 14px;
`;

const FOOTER_LOCATIONS = ["footer-menu1", "footer-menu2", "footer-menu3", "footer-menu4"];

export default function Footer() {
  const [footerColumns, setFooterColumns] = useState([]);

  useEffect(() => {
    const client = getMedusaClient();
    client.getMenus().then((data) => {
      const menus = data.menus || [];
      const columns = FOOTER_LOCATIONS.map((loc) => {
        const menu = menus.find((m) => (m.location || "").toLowerCase() === loc.toLowerCase());
        if (!menu) return null;
        const items = (menu.items || []).filter((i) => !i.parent_id);
        return { location: loc, menu, items };
      }).filter(Boolean);
      setFooterColumns(columns);
    }).catch(() => setFooterColumns([]));
  }, []);

  return (
    <FooterContainer>
      <Container>
        {footerColumns.length > 0 && (
          <Grid $columns={footerColumns.length}>
            {footerColumns.map(({ location, menu, items }) => (
              <Column key={location}>
                <Title>{menu.name || "Menü"}</Title>
                {items.length > 0 ? (
                  items.map((item) => (
                    <FooterLink key={item.id} href={menuItemHref(item)}>{item.label}</FooterLink>
                  ))
                ) : (
                  <Placeholder>Keine Einträge</Placeholder>
                )}
              </Column>
            ))}
          </Grid>
        )}
        <Bottom>
          <Copyright>© {new Date().getFullYear()} Belucha. All rights reserved.</Copyright>
          <FooterLink href={process.env.NEXT_PUBLIC_SELLERCENTRAL_URL || "https://belucha-sellercentral.vercel.app"}>
            Für Händler
          </FooterLink>
        </Bottom>
      </Container>
    </FooterContainer>
  );
}

