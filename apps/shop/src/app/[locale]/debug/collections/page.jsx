"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

/**
 * Debug: Backend'deki tüm koleksiyonları listeler (id, handle, title).
 * Shop'un gördüğü backend = NEXT_PUBLIC_MEDUSA_BACKEND_URL.
 * URL: /[locale]/debug/collections (örn. /de/debug/collections)
 * Production'da bu sayfayı kaldırabilir veya koruma altına alabilirsin.
 */
export default function DebugCollectionsPage() {
  const params = useParams();
  const locale = params?.locale || "en";
  const [collections, setCollections] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [colRes, menuRes] = await Promise.all([
          fetch("/api/store-collections").then((r) => r.json()),
          fetch("/api/store-menus").then((r) => r.json()).catch(() => ({ menus: [] })),
        ]);
        if (cancelled) return;
        setCollections(colRes?.collections ?? []);
        const menusList = menuRes?.menus ?? [];
        setMenus(menusList);
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <p>Yükleniyor…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif", color: "#b91c1c" }}>
        <p>Hata: {error}</p>
      </div>
    );
  }

  const flattenItems = (items, out = []) => {
    if (!Array.isArray(items)) return out;
    for (const it of items) {
      out.push(it);
      if (it.items?.length) flattenItems(it.items, out);
    }
    return out;
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 1000 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Debug: Koleksiyonlar &amp; Menü linkleri</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Backend’den gelen koleksiyon listesi ve menüdeki collection linkleri. Electronics’in id/handle’ını buradan kontrol edebilirsin.
      </p>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>Store koleksiyonları (backend’deki tablo)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
            <th style={{ padding: "8px 12px" }}>id</th>
            <th style={{ padding: "8px 12px" }}>handle</th>
            <th style={{ padding: "8px 12px" }}>title</th>
            <th style={{ padding: "8px 12px" }}>Shop linki</th>
          </tr>
        </thead>
        <tbody>
          {collections.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: 16, color: "#666" }}>Hiç koleksiyon yok.</td>
            </tr>
          ) : (
            collections.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12 }}>{c.id}</td>
                <td style={{ padding: "8px 12px" }}>{c.handle ?? "—"}</td>
                <td style={{ padding: "8px 12px" }}>{c.title ?? "—"}</td>
                <td style={{ padding: "8px 12px" }}>
                  <Link href={`/${c.id}`} style={{ color: "#0ea5e9" }}>/{locale}/{c.id}</Link>
                  {c.handle && (
                    <> · <Link href={`/${c.handle}`} style={{ color: "#0ea5e9" }}>/{locale}/{c.handle}</Link></>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>Menü öğeleri (collection tipi)</h2>
      <p style={{ color: "#666", marginBottom: 8 }}>Menüde “collection” olan her öğenin link_value’su (id/handle). Electronics burada nasıl görünüyor kontrol et.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
            <th style={{ padding: "8px 12px" }}>label</th>
            <th style={{ padding: "8px 12px" }}>link_type</th>
            <th style={{ padding: "8px 12px" }}>link_value (ham)</th>
          </tr>
        </thead>
        <tbody>
          {menus.flatMap((menu) => flattenItems(menu.items || [])).filter((it) => it.link_type === "collection").length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: 16, color: "#666" }}>Menüde collection tipinde öğe yok.</td>
            </tr>
          ) : (
            menus.flatMap((menu) =>
              flattenItems(menu.items || []).filter((it) => it.link_type === "collection").map((it) => (
                <tr key={it.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px 12px" }}>{it.label ?? "—"}</td>
                  <td style={{ padding: "8px 12px" }}>{it.link_type}</td>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>{typeof it.link_value === "string" ? it.link_value : JSON.stringify(it.link_value)}</td>
                </tr>
              ))
            )
          )}
        </tbody>
      </table>

      <p style={{ marginTop: 24, color: "#666", fontSize: 12 }}>
        Electronics bu tabloda yoksa backend’de o handle/id ile koleksiyon yok demektir. Menüde link_value içinde id (UUID) varsa, shop linki olarak /{locale}/[UUID] kullan; yoksa sellercentral’de menü öğesini tekrar kaydedip id’nin gelmesini sağla.
      </p>
    </div>
  );
}
