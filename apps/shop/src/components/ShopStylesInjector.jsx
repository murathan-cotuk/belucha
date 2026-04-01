"use client";

import { useEffect } from "react";

const BACKEND_URL = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "");

// Default styles — used until backend responds (prevents FOUC)
const DEFAULTS = {
  colors: {
    primary:    "#ff971c",
    secondary:  "#111827",
    accent:     "#ef8200",
    text:       "#111827",
    background: "#ffffff",
  },
};

function getActiveCode(buttons, key) {
  const btn = buttons?.[key];
  if (!btn?.variants?.length) return "";
  const active = btn.variants.find((v) => v.active) || btn.variants[0];
  return active?.code || "";
}

function buildCSS(styles) {
  const colors = { ...DEFAULTS.colors, ...(styles?.colors || {}) };
  const buttons = styles?.buttons || {};

  const vars = `
:root {
  --shop-primary:    ${colors.primary};
  --shop-secondary:  ${colors.secondary};
  --shop-accent:     ${colors.accent};
  --shop-text:       ${colors.text};
  --shop-bg:         ${colors.background};
}`.trim();

  const atcCode   = getActiveCode(buttons, "add_to_cart");
  const primCode  = getActiveCode(buttons, "primary");
  const secCode   = getActiveCode(buttons, "secondary");

  return [vars, atcCode, primCode, secCode].filter(Boolean).join("\n\n");
}

export default function ShopStylesInjector() {
  useEffect(() => {
    // Inject defaults immediately (no FOUC)
    inject(buildCSS(DEFAULTS));

    // Fetch and apply real styles from backend
    fetch(`${BACKEND_URL}/store/styles`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.styles) inject(buildCSS(data.styles));
      })
      .catch(() => {}); // keep defaults on error
  }, []);

  return null;
}

function inject(css) {
  let tag = document.getElementById("shop-theme-styles");
  if (!tag) {
    tag = document.createElement("style");
    tag.id = "shop-theme-styles";
    document.head.appendChild(tag);
  }
  tag.textContent = css;
}
