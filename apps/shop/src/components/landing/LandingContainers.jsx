"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getMedusaClient } from "@/lib/medusa-client";
import { useRouter } from "@/i18n/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

function resolveUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return `${BACKEND_URL}/uploads/${url}`;
}

// ── Hero Banner Slider ────────────────────────────────────────────────────────
function HeroBanner({ container }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const slides = (container.slides || []).filter((s) => s.image);
  const height = container.height || "500px";

  const goTo = useCallback((idx) => {
    setCurrent(idx);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (container.autoplay !== false && slides.length > 1) {
      timerRef.current = setTimeout(() => {
        setCurrent((c) => (c + 1) % slides.length);
      }, container.delay || 4000);
    }
  }, [slides.length, container.autoplay, container.delay]);

  useEffect(() => {
    if (slides.length > 1 && container.autoplay !== false) {
      timerRef.current = setTimeout(() => {
        setCurrent((c) => (c + 1) % slides.length);
      }, container.delay || 4000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, slides.length, container.autoplay, container.delay]);

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <div style={{ position: "relative", width: "100%", height, overflow: "hidden", background: "#111" }}>
      {/* Image */}
      {slides.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute", inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.7s ease",
          }}
        >
          <img
            src={resolveUrl(s.image)}
            alt={s.title || ""}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {/* Overlay */}
          {(s.overlay > 0) && (
            <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${(s.overlay || 0) / 100})` }} />
          )}
        </div>
      ))}

      {/* Text content */}
      {(slide.title || slide.subtitle || slide.btn_text) && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", padding: "24px 40px", textAlign: "center", pointerEvents: "none",
        }}>
          {slide.title && (
            <h2 style={{ fontSize: "clamp(24px, 4vw, 56px)", fontWeight: 900, color: slide.text_color || "#fff", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.3)", lineHeight: 1.1, marginBottom: slide.subtitle ? 12 : 0 }}>
              {slide.title}
            </h2>
          )}
          {slide.subtitle && (
            <p style={{ fontSize: "clamp(14px, 2vw, 22px)", color: slide.text_color || "#fff", margin: "0 0 20px", textShadow: "0 1px 4px rgba(0,0,0,0.3)", maxWidth: 600 }}>
              {slide.subtitle}
            </p>
          )}
          {slide.btn_text && slide.btn_url && (
            <a
              href={slide.btn_url}
              style={{ pointerEvents: "auto", display: "inline-block", padding: "12px 28px", background: "#ff971c", color: "#fff", border: "2px solid #000", borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: "none", boxShadow: "0 3px 0 2px #000", transition: "transform .12s" }}
            >
              {slide.btn_text}
            </a>
          )}
        </div>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 24 : 10, height: 10,
                borderRadius: 5, border: "none", cursor: "pointer",
                background: i === current ? "#ff971c" : "rgba(255,255,255,0.6)",
                transition: "all .3s", padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
          >‹</button>
          <button
            onClick={() => goTo((current + 1) % slides.length)}
            style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
          >›</button>
        </>
      )}
    </div>
  );
}

// ── Text Block ────────────────────────────────────────────────────────────────
function TextBlock({ container }) {
  const align = container.align || "center";
  return (
    <div style={{ background: container.bg_color || "#fff", padding: "48px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: align }}>
        {container.title && <h2 style={{ fontSize: "clamp(20px, 3vw, 36px)", fontWeight: 800, color: container.text_color || "#111827", margin: "0 0 16px" }}>{container.title}</h2>}
        {container.body && <p style={{ fontSize: 16, color: container.text_color || "#374151", lineHeight: 1.7, margin: "0 0 24px", whiteSpace: "pre-line" }}>{container.body}</p>}
        {container.btn_text && container.btn_url && (
          <a href={container.btn_url} style={{ display: "inline-block", padding: "12px 28px", background: "#ff971c", color: "#fff", border: "2px solid #000", borderRadius: 8, fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "0 3px 0 2px #000" }}>
            {container.btn_text}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Image + Text ──────────────────────────────────────────────────────────────
function ImageText({ container }) {
  const imageLeft = container.image_side !== "right";
  const imgSrc = resolveUrl(container.image);
  return (
    <div style={{ background: container.bg_color || "#fff", padding: "48px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: imageLeft ? "row" : "row-reverse", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
        {imgSrc && (
          <div style={{ flex: "0 0 auto", width: "min(45%, 480px)" }}>
            <img src={imgSrc} alt={container.title || ""} style={{ width: "100%", borderRadius: 12, display: "block", border: "2px solid #000", boxShadow: "0 4px 0 2px #000" }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 240 }}>
          {container.title && <h2 style={{ fontSize: "clamp(20px, 2.5vw, 32px)", fontWeight: 800, color: container.text_color || "#111827", margin: "0 0 12px" }}>{container.title}</h2>}
          {container.body && <p style={{ fontSize: 16, color: container.text_color || "#374151", lineHeight: 1.7, margin: "0 0 20px", whiteSpace: "pre-line" }}>{container.body}</p>}
          {container.btn_text && container.btn_url && (
            <a href={container.btn_url} style={{ display: "inline-block", padding: "10px 24px", background: "#ff971c", color: "#fff", border: "2px solid #000", borderRadius: 8, fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "0 3px 0 2px #000" }}>
              {container.btn_text}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Image Grid ────────────────────────────────────────────────────────────────
function ImageGrid({ container }) {
  const cols = container.cols || 2;
  const gap = container.gap || 16;
  const images = (container.images || []).filter((i) => i.url);
  if (!images.length) return null;
  return (
    <div style={{ padding: "32px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
        {images.map((img, i) => {
          const el = (
            <img key={i} src={resolveUrl(img.url)} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 10, display: "block", border: "1px solid #e5e7eb" }} />
          );
          return img.link ? (
            <a key={i} href={img.link} style={{ display: "block" }}>{el}</a>
          ) : (
            <div key={i}>{el}</div>
          );
        })}
      </div>
    </div>
  );
}

// ── Banner CTA ────────────────────────────────────────────────────────────────
function BannerCta({ container }) {
  return (
    <div style={{ background: container.bg_color || "#ff971c", padding: "40px 24px", textAlign: "center" }}>
      {container.title && <h2 style={{ fontSize: "clamp(20px, 3vw, 36px)", fontWeight: 900, color: container.text_color || "#fff", margin: "0 0 8px", textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>{container.title}</h2>}
      {container.subtitle && <p style={{ fontSize: 16, color: container.text_color || "#fff", margin: "0 0 20px", opacity: 0.9 }}>{container.subtitle}</p>}
      {container.btn_text && container.btn_url && (
        <a href={container.btn_url} style={{ display: "inline-block", padding: "12px 28px", background: "#fff", color: "#111827", border: "2px solid #000", borderRadius: 8, fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "0 3px 0 2px #000" }}>
          {container.btn_text}
        </a>
      )}
    </div>
  );
}

// ── Renderer ──────────────────────────────────────────────────────────────────
function renderContainer(c) {
  if (!c.visible) return null;
  switch (c.type) {
    case "hero_banner": return <HeroBanner key={c.id} container={c} />;
    case "text_block": return <TextBlock key={c.id} container={c} />;
    case "image_text": return <ImageText key={c.id} container={c} />;
    case "image_grid": return <ImageGrid key={c.id} container={c} />;
    case "banner_cta": return <BannerCta key={c.id} container={c} />;
    default: return null;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LandingContainers() {
  const [containers, setContainers] = useState(null);

  useEffect(() => {
    getMedusaClient().request("/store/landing-page").then((data) => {
      if (Array.isArray(data?.containers)) setContainers(data.containers);
    }).catch(() => {});
  }, []);

  if (!containers || containers.length === 0) return null;

  return (
    <div>
      {containers.map((c) => renderContainer(c))}
    </div>
  );
}
