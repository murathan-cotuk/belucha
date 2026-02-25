"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { useCustomerAuth as useAuth } from "@belucha/lib";
import { getMedusaClient } from "@/lib/medusa-client";
import TopBar from "@/components/TopBar";
import DropdownSearch from "@/components/DropdownSearch";

const SCROLL_THRESHOLD = 60;

function menuItemHref(item) {
  if (!item) return "#";
  if (item.link_type === "url" && item.link_value) return item.link_value.startsWith("http") ? item.link_value : `/${item.link_value.replace(/^\//, "")}`;
  if ((item.link_type === "category" || item.link_type === "collection") && item.link_value) return `/collections/${item.link_value}`;
  if (item.link_type === "page" && item.link_value) return `/pages/${item.link_value}`;
  if (item.link_type === "product" && item.link_value) return `/product/${item.link_value}`;
  return item.link_value ? `/${String(item.link_value).replace(/^\//, "")}` : "#";
}

const HeaderWrap = styled.header`
  position: sticky;
  top: 0;
  z-index: 200;
  background: white;
  box-shadow: ${(p) => (p.$compact ? "0 1px 3px rgba(0,0,0,0.08)" : "none")};
  transition: transform 0.25s ease, box-shadow 0.2s ease;
  transform: ${(p) => (p.$hidden ? "translateY(-100%)" : "translateY(0)")};
`;

const TopBarWrap = styled.div`
  transition: transform 0.25s ease, opacity 0.25s ease, max-height 0.25s ease;
  overflow: hidden;
  max-height: ${(p) => (p.$hide ? "0" : "50px")};
  opacity: ${(p) => (p.$hide ? 0 : 1)};
`;

const NavRow = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${(p) => (p.$compact ? "12px 24px" : "20px 24px")};
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const Logo = styled(Link)`
  font-size: ${(p) => (p.$compact ? "20px" : "24px")};
  font-weight: 700;
  color: #0ea5e9;
  font-family: "Manrope", sans-serif;
  letter-spacing: 0.05em;
  text-decoration: none;
`;

const Center = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
`;

const SearchWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

const CategoriesDropdown = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const CategoriesButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #e2e8f0;
  }
`;

const CategoriesPanel = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 220px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  padding: 8px 0;
  z-index: 1000;
  display: ${(p) => (p.$open ? "block" : "none")};
`;

const CategoryItem = styled(Link)`
  display: block;
  padding: 10px 16px;
  color: #374151;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    background: #f3f4f6;
    color: #0ea5e9;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: #374151;
  transition: background 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #0ea5e9;
  }
`;

const CartBtn = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: #374151;
  position: relative;
  transition: background 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #0ea5e9;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  padding: 8px 0;
  z-index: 1000;
  display: ${(p) => (p.$open ? "block" : "none")};
`;

const UserDropdownItem = styled(Link)`
  display: block;
  padding: 10px 16px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;

  &:hover {
    background: #f3f4f6;
    color: #0ea5e9;
  }
`;

const UserDropdownBtn = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  font-size: 14px;
  color: #374151;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
    color: #0ea5e9;
  }
`;

const SecondMenuRow = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  gap: 24px;
  align-items: center;
  font-size: 14px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  transition: max-height 0.25s ease, opacity 0.25s ease, padding 0.25s ease;
  overflow: hidden;
  max-height: ${(p) => (p.$hide ? "0" : "48px")};
  opacity: ${(p) => (p.$hide ? 0 : 1)};
  padding: ${(p) => (p.$hide ? "0 24px" : "10px 24px")};
`;

const SecondLink = styled(Link)`
  color: #6b7280;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    color: #0ea5e9;
  }
`;

const CompactOnly = styled.div`
  display: ${(p) => (p.$show ? "flex" : "none")};
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
`;

export default function ShopHeader() {
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [compact, setCompact] = useState(false);
  const [mainMenuOpen, setMainMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mainMenuItems, setMainMenuItems] = useState([]);
  const [secondMenuItems, setSecondMenuItems] = useState([]);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const client = getMedusaClient();
    client.getMenus().then((data) => {
      const menus = data.menus || [];
      const main = menus.find((m) => (m.location || "").toLowerCase() === "main") || menus[0];
      const second = menus.find((m) => (m.location || "").toLowerCase() === "second");
      setMainMenuItems(main?.items?.filter((i) => !i.parent_id) || []);
      setSecondMenuItems(second?.items?.filter((i) => !i.parent_id) || []);
    }).catch((err) => {
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        console.warn("ShopHeader getMenus:", err?.message || err);
      }
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setScrollY(y);
      setLastScrollY((prev) => {
        if (y > prev) {
          if (y > SCROLL_THRESHOLD) setHeaderVisible(false);
        } else {
          setHeaderVisible(true);
          setCompact(y > SCROLL_THRESHOLD);
        }
        return y;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const close = () => {
      setMainMenuOpen(false);
      setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", (e) => {
      if (!e.target.closest("[data-categories-dropdown]") && !e.target.closest("[data-user-menu]")) close();
    });
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const showFull = scrollY <= SCROLL_THRESHOLD;
  const showTopBar = headerVisible && showFull;
  const showSecondMenu = headerVisible && showFull;
  const showCompact = headerVisible && compact;
  const headerHidden = !headerVisible;

  return (
    <HeaderWrap $compact={showCompact} $hidden={headerHidden}>
      <TopBarWrap $hide={!showTopBar && !showCompact}>
        {showFull ? <TopBar /> : showCompact ? <div style={{ height: 0 }} /> : null}
      </TopBarWrap>

      {showCompact && (
        <NavRow $compact>
          <CompactOnly $show>
            <Logo href="/" $compact>Belucha</Logo>
            <SearchWrap>
              <DropdownSearch
                placeholder="Suchen..."
                hitsPerPage={5}
                attributes={{ primaryText: "title", secondaryText: "description", url: "handle", image: "thumbnail" }}
              />
            </SearchWrap>
          </CompactOnly>
        </NavRow>
      )}

      {!showCompact && (
        <>
          <NavRow $compact={false}>
            <Logo href="/">Belucha</Logo>
            <Center>
              <CategoriesDropdown data-categories-dropdown>
                <CategoriesButton type="button" onClick={() => setMainMenuOpen((v) => !v)}>
                  Kategorien <i className="fas fa-chevron-down" style={{ fontSize: 10 }} />
                </CategoriesButton>
                <CategoriesPanel $open={mainMenuOpen}>
                  {mainMenuItems.length === 0 && <div style={{ padding: 12, color: "#6b7280" }}>Keine Kategorien</div>}
                  {mainMenuItems.map((item) => (
                    <CategoryItem key={item.id} href={menuItemHref(item)} onClick={() => setMainMenuOpen(false)}>
                      {item.label}
                    </CategoryItem>
                  ))}
                </CategoriesPanel>
              </CategoriesDropdown>
              <SearchWrap>
                <DropdownSearch
                  placeholder="Produkte suchen..."
                  hitsPerPage={5}
                  attributes={{ primaryText: "title", secondaryText: "description", url: "handle", image: "thumbnail" }}
                />
              </SearchWrap>
            </Center>
            <Right>
              <UserMenu data-user-menu>
                <UserBtn type="button" onClick={() => setUserMenuOpen((v) => !v)} title="Konto">
                  <i className="fas fa-user" style={{ fontSize: 18 }} />
                </UserBtn>
                <UserDropdown $open={userMenuOpen}>
                  {isAuthenticated ? (
                    <>
                      {user && <div style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>{user.firstName} {user.lastName}</div>}
                      <UserDropdownItem href="/account" onClick={() => setUserMenuOpen(false)}>Hesap bilgilerim</UserDropdownItem>
                      <UserDropdownItem href="/orders" onClick={() => setUserMenuOpen(false)}>Siparişler</UserDropdownItem>
                      <UserDropdownItem href="/reviews" onClick={() => setUserMenuOpen(false)}>Yorumlar</UserDropdownItem>
                      <UserDropdownItem href="/invoices" onClick={() => setUserMenuOpen(false)}>Faturalar</UserDropdownItem>
                      <UserDropdownItem href="/favorites" onClick={() => setUserMenuOpen(false)}>Merkzettel</UserDropdownItem>
                      <UserDropdownItem href="/addresses" onClick={() => setUserMenuOpen(false)}>Adressen</UserDropdownItem>
                      <UserDropdownItem href="/bonus" onClick={() => setUserMenuOpen(false)}>Meine Bonuspunkte</UserDropdownItem>
                      <UserDropdownItem href="/language" onClick={() => setUserMenuOpen(false)} style={{ borderTop: "1px solid #e5e7eb", marginTop: 4, paddingTop: 8 }}>Dil (DE)</UserDropdownItem>
                      <UserDropdownBtn onClick={() => { logout(); setUserMenuOpen(false); }}>Abmelden</UserDropdownBtn>
                    </>
                  ) : (
                    <>
                      <UserDropdownItem href="/login" onClick={() => setUserMenuOpen(false)}>Anmelden</UserDropdownItem>
                      <UserDropdownItem href="/register" onClick={() => setUserMenuOpen(false)}>Registrieren</UserDropdownItem>
                      <UserDropdownItem href="/language" onClick={() => setUserMenuOpen(false)} style={{ borderTop: "1px solid #e5e7eb", marginTop: 4, paddingTop: 8 }}>Dil (DE)</UserDropdownItem>
                    </>
                  )}
                </UserDropdown>
              </UserMenu>
              <CartBtn href="/cart" title="Sepet">
                <i className="fas fa-shopping-cart" style={{ fontSize: 18 }} />
                <CartBadge>0</CartBadge>
              </CartBtn>
            </Right>
          </NavRow>

          <SecondMenuRow $hide={!showSecondMenu}>
            {secondMenuItems.length > 0 ? (
              secondMenuItems.map((item) => (
                <SecondLink key={item.id} href={menuItemHref(item)}>{item.label}</SecondLink>
              ))
            ) : (
              <>
                <SecondLink href="/bestsellers">Bestsellers</SecondLink>
                <SecondLink href="/sale">Angebote</SecondLink>
                <SecondLink href="/recommended">Für Sie empfohlen</SecondLink>
              </>
            )}
          </SecondMenuRow>
        </>
      )}
    </HeaderWrap>
  );
}
