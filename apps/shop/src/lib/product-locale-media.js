/**
 * Product / variant images stored by sellercentral:
 * - Gallery: metadata.media (DE) or metadata.translations[locale].media when set.
 * - Variants: image_url (default) + image_urls[locale] overrides.
 */

export function localizedProductMediaList(product, locale) {
  const meta = product?.metadata || {};
  const loc = String(locale || "de").toLowerCase();
  const tr = meta.translations?.[loc];
  if (tr && Array.isArray(tr.media) && tr.media.length > 0) return tr.media;
  return Array.isArray(meta.media) ? meta.media : [];
}

export function variantImageUrlForLocale(variant, locale) {
  if (!variant) return "";
  const loc = String(locale || "de").toLowerCase();
  const map = variant.image_urls && typeof variant.image_urls === "object" ? variant.image_urls : {};
  if (map[loc]) return map[loc];
  const keys = Object.keys(map).filter((k) => map[k] != null && String(map[k]).trim() !== "");
  if (keys.length === 0) return variant.image_url || "";
  if (map.de) return map.de;
  if (loc === "de") return variant.image_url || "";
  return variant.image_url || "";
}
