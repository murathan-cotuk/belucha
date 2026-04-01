/**
 * Product URL slug for the current storefront language.
 * Per-locale handles live in metadata.translations[locale].handle (sellercentral).
 */
export function storefrontProductHandle(product, locale) {
  if (!product) return "";
  const loc = String(locale || "de").toLowerCase();
  const tr = product.metadata?.translations?.[loc];
  const h = (tr?.handle || "").trim();
  if (h) return h;
  return String(product.handle || "").trim();
}
