"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useCustomerAuth as useAuth } from "@belucha/lib";

const ORANGE = "#ff971c";
const DARK = "#1A1A1A";
const GRAY = "#6b7280";
const BORDER = "#e5e7eb";

const LOCALE_RE = /^\/(en|de|tr|fr|it|es)(?=\/|$)/i;

const NAV = [
  { label: "Übersicht", icon: "👤", href: "/account" },
  { label: "Meine Bestellungen", icon: "📦", href: "/orders" },
  { label: "Merkzettel", icon: "♥", href: "/favorites" },
  { label: "Adressen", icon: "📍", href: "/addresses" },
  { label: "Bonuspunkte", icon: "⭐", href: "/bonus" },
  { label: "Yorumlar", icon: "💬", href: "/reviews" },
  { label: "Faturalar", icon: "📄", href: "/invoices" },
];

function normalizePath(pathname) {
  if (!pathname) return "/";
  const x = pathname.replace(LOCALE_RE, "") || "/";
  return x.startsWith("/") ? x : `/${x}`;
}

export default function AccountSidebar({ onLogout }) {
  const pathname = usePathname() || "/";
  const appPath = normalizePath(pathname);
  const { user } = useAuth();

  return (
    <nav style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      {user && (
        <div style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600, color: DARK, borderBottom: `1px solid ${BORDER}` }}>
          {user.firstName} {user.lastName}
        </div>
      )}
      {NAV.map((item) => {
        const active =
          item.href === "/account"
            ? appPath === "/account"
            : appPath === item.href || appPath.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 18px",
              fontSize: 14,
              fontWeight: 500,
              color: active ? ORANGE : DARK,
              background: active ? "#fff7ed" : "transparent",
              borderLeft: active ? `3px solid ${ORANGE}` : "3px solid transparent",
              textDecoration: "none",
              borderBottom: `1px solid ${BORDER}`,
              transition: "all 0.1s",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          fontSize: 14,
          fontWeight: 500,
          color: "#ef4444",
          background: "transparent",
          border: "none",
          borderLeft: "3px solid transparent",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 16 }}>🚪</span>
        Abmelden
      </button>
    </nav>
  );
}
