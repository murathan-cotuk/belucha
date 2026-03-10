"use client";

import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  AppProvider,
  Frame,
  Navigation,
  TopBar,
  Button,
  Modal,
  Text,
} from "@shopify/polaris";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import {
  HomeIcon,
  ProductIcon,
  OrderIcon,
  ProfileIcon,
  ChartVerticalIcon,
  MegaphoneIcon,
  DiscountIcon,
  SettingsIcon,
  ListBulletedIcon,
  ImportIcon,
} from "@shopify/polaris-icons";
import dynamic from "next/dynamic";
import en from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

const discardBtnStyles = `
  .belucha-discard-topbar-btn,
  .belucha-discard-topbar-btn *,
  .belucha-discard-topbar-btn span { color: #ffffff !important; }
`;

const GroupedDropdownSearch = dynamic(
  () => import("./GroupedDropdownSearch").then((m) => m.default),
  { ssr: false, loading: () => <div style={{ width: "100%", maxWidth: 400, height: 36 }} /> }
);

function getMenuItemsMain(t) {
  return [
    { url: "/dashboard", label: t("home"), icon: HomeIcon },
    {
      url: "/orders",
      label: t("orders"),
      icon: OrderIcon,
      subNavigationItems: [
        { url: "/orders/drafts", label: t("drafts") },
        { url: "/orders/abandoned-checkouts", label: t("abandonedCheckouts") },
        { url: "/orders/returns", label: t("returns") },
      ],
    },
    {
      url: "/products",
      label: t("products"),
      icon: ProductIcon,
      subNavigationItems: [
        { url: "/products/inventory", label: t("inventory") },
        { url: "/products/collections", label: t("collections") },
        { url: "/products/gift-cards", label: t("giftCards") },
      ],
    },
    { url: "/customers", label: t("customers"), icon: ProfileIcon },
    {
      url: "/marketing",
      label: t("marketing"),
      icon: MegaphoneIcon,
      subNavigationItems: [
        { url: "/marketing/campaigns", label: t("campaigns") },
        { url: "/marketing/attribution", label: t("attribution") },
        { url: "/marketing/automations", label: t("automations") },
      ],
    },
    { url: "/discounts", label: t("discounts"), icon: DiscountIcon },
    {
      url: "/content",
      label: t("content"),
      icon: ListBulletedIcon,
      subNavigationItems: [
        { url: "/content/metaobjects", label: t("metaobjects") },
        { url: "/content/categories", label: t("categories") },
        { url: "/content/media", label: t("media") },
        { url: "/content/pages", label: t("pages") },
        { url: "/content/files", label: t("files") },
        { url: "/content/menus", label: t("menus") },
        { url: "/content/blog-posts", label: t("blogPosts") },
        { url: "/content/brands", label: t("brands") },
      ],
    },
    {
      url: "/analytics",
      label: t("analytics"),
      icon: ChartVerticalIcon,
      subNavigationItems: [
        { url: "/analytics/reports", label: t("reports") },
        { url: "/analytics/live-view", label: t("liveView") },
      ],
    },
    { url: "/import-export", label: t("importExport"), icon: ImportIcon },
  ];
}

function getMenuItemsSettings(t) {
  return [{ url: "/settings", label: t("settings"), icon: SettingsIcon }];
}

const NextLink = forwardRef(function NextLink({ url, children, ...rest }, ref) {
  return (
    <Link href={url || ""} ref={ref} {...rest}>
      {children}
    </Link>
  );
});

const UnsavedAwareLink = forwardRef(function UnsavedAwareLink({ url, children, ...rest }, ref) {
  const ctx = useUnsavedChanges();
  const handleClick = (e) => {
    if (ctx?.isDirty && (url || "").trim() && !(url || "").startsWith("#")) {
      e.preventDefault();
      ctx.startNavigate(url || "/");
    }
  };
  return (
    <Link ref={ref} href={url || "#"} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
});

export default function PolarisLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const unsaved = useUnsavedChanges();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const storeName =
    typeof window !== "undefined"
      ? localStorage.getItem("storeName") || "Seller Account"
      : "Seller Account";

  useEffect(() => {
    if (pathname === "/login" || pathname === "/register") return;
    const loggedIn = localStorage.getItem("sellerLoggedIn");
    if (!loggedIn) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  // Nav seçili öğe: sadece mevcut path vurgulansın (Home "/" başka sayfadayken vurgulu kalmasın)
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.setAttribute("data-pathname", pathname || "/");
    return () => {
      document.body.removeAttribute("data-pathname");
    };
  }, [pathname]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("sellerLoggedIn");
    localStorage.removeItem("sellerEmail");
    localStorage.removeItem("sellerId");
    localStorage.removeItem("storeName");
    router.push("/login");
  }, [router]);

  const userMenuActions = [
    {
      items: [
        { content: "Settings", url: "/settings" },
        { content: "Logout", destructive: true, onAction: handleLogout },
      ],
    },
  ];

  const getUserInitials = () => {
    if (storeName && storeName !== "Seller Account") {
      return storeName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return "S";
  };

  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      onNavigationToggle={() => setShowMobileNav((v) => !v)}
      userMenu={
        <TopBar.UserMenu
          name={storeName}
          detail=""
          initials={getUserInitials()}
          actions={userMenuActions}
          open={userMenuOpen}
          onToggle={() => setUserMenuOpen((v) => !v)}
        />
      }
      searchField={
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 520 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <GroupedDropdownSearch placeholder="Search products, orders, customers..." />
          </div>
          {unsaved?.isDirty && (
            <>
              <style>{discardBtnStyles}</style>
              <div className="belucha-discard-topbar-btn">
                <Button
                  size="slim"
                  variant="tertiary"
                  onClick={() => unsaved.runDiscard()}
                  style={{
                    background: "#4d4d4d",
                    color: "#ffffff",
                    border: "1px solid #5c5c5c",
                  }}
                >
                  Discard
                </Button>
              </div>
              <Button
                size="medium"
                variant="secondary"
                onClick={() => unsaved.runSave()}
                style={{
                  background: "#fff",
                  color: "#202223",
                  border: "2px solid #202223",
                  fontWeight: 600,
                  minWidth: 80,
                }}
              >
                Save
              </Button>
            </>
          )}
        </div>
      }
    />
  );

  const navLocation = pathname && pathname !== "" ? pathname : "/";
  const menuMain = getMenuItemsMain(t);
  const menuSettings = getMenuItemsSettings(t);

  const navMarkup = (
    <Navigation location={navLocation} onDismiss={() => setShowMobileNav(false)}>
      <Navigation.Section
        items={menuMain.map((item) => ({
          url: item.url,
          label: item.label,
          icon: item.icon,
          subNavigationItems: item.subNavigationItems,
        }))}
      />
      <Navigation.Section
        fill
        separator
        items={menuSettings.map((item) => ({
          url: item.url,
          label: item.label,
          icon: item.icon,
        }))}
      />
    </Navigation>
  );

  const linkComponent = unsaved ? UnsavedAwareLink : NextLink;

  return (
    <AppProvider i18n={en} linkComponent={linkComponent}>
      <Frame
        navigation={navMarkup}
        topBar={topBarMarkup}
        showMobileNavigation={showMobileNav}
        onNavigationDismiss={() => setShowMobileNav(false)}
      >
        {unsaved?.showNavigateConfirm && (
          <Modal
            open={true}
            onClose={() => unsaved.setShowNavigateConfirm(false)}
            title="Unsaved changes"
            primaryAction={{
              content: "Save",
              onAction: () => unsaved.runSave(),
            }}
            secondaryActions={[
              {
                content: "Discard",
                destructive: true,
                onAction: () => unsaved.runDiscard(),
              },
            ]}
          >
            <Modal.Section>
              <Text as="p">You have unsaved changes. Save or discard before leaving.</Text>
            </Modal.Section>
          </Modal>
        )}
        <div className="belucha-scroll-wrapper">
          <div className="belucha-page-content belucha-page-content-transition">
            {children}
          </div>
        </div>
      </Frame>
    </AppProvider>
  );
}
