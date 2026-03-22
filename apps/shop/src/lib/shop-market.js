/**
 * Shop URL: /{country}/{language}/{currency}/…
 * Internal Next.js routes stay /{language}/… (next-intl); middleware rewrites.
 */

export const SHOP_LOCALES = ["en", "de", "tr", "fr", "it", "es"];

/** Lowercase ISO country (market) codes in URL */
export const SHOP_MARKETS = ["de", "at", "ch", "fr", "it", "es", "tr", "gb", "us"];

/** Lowercase currency codes in URL */
export const SHOP_CURRENCIES = ["eur", "gbp", "chf", "usd", "try"];

const LOCALE_SET = new Set(SHOP_LOCALES);
const MARKET_SET = new Set(SHOP_MARKETS);
const CURRENCY_SET = new Set(SHOP_CURRENCIES);

export const DEFAULT_MARKET = "de";
export const DEFAULT_CURRENCY = "eur";

/** Default market when only language is known (legacy redirects). */
export function defaultMarketForLocale(locale) {
  const l = String(locale || "de").toLowerCase();
  if (l === "en") return "gb";
  if (l === "tr") return "tr";
  if (l === "fr") return "fr";
  if (l === "it") return "it";
  if (l === "es") return "es";
  return "de";
}

/** Default URL currency segment for a market country (lowercase ISO). */
export function defaultCurrencyForMarket(market) {
  const m = String(market || "de").toLowerCase();
  if (m === "gb") return "gbp";
  if (m === "ch") return "chf";
  if (m === "us") return "usd";
  if (m === "tr") return "try";
  return "eur";
}

export function isValidMarket(s) {
  return MARKET_SET.has(String(s || "").toLowerCase());
}
export function isValidLocale(s) {
  return LOCALE_SET.has(String(s || "").toLowerCase());
}
export function isValidCurrency(s) {
  return CURRENCY_SET.has(String(s || "").toLowerCase());
}

/**
 * @param {string} pathname browser path e.g. /de/es/eur/produkt/x
 * @returns {{ country: string, lang: string, currency: string, rest: string } | null}
 */
export function parseMarketPath(pathname) {
  const p = pathname || "";
  const parts = p.split("/").filter(Boolean);
  if (parts.length < 3) return null;
  const country = parts[0].toLowerCase();
  const lang = parts[1].toLowerCase();
  const currency = parts[2].toLowerCase();
  if (!isValidMarket(country) || !isValidLocale(lang) || !isValidCurrency(currency)) return null;
  const rest = "/" + parts.slice(3).join("/");
  return { country, lang, currency, rest: rest === "/" ? "" : rest };
}

export function marketPrefix(country, lang, currency) {
  return `/${String(country).toLowerCase()}/${String(lang).toLowerCase()}/${String(currency).toLowerCase()}`;
}

/**
 * @param {string} targetPath path without market prefix, e.g. /produkt/foo or /cart
 */
export function hrefWithMarket(prefix, targetPath) {
  let t = targetPath || "/";
  if (!t.startsWith("/")) t = `/${t}`;
  return `${prefix}${t}`;
}

const INTERNAL_LOCALE_PREFIX = /^\/(en|de|tr|fr|it|es)(?=\/|$)/i;

/** Path after /country/lang/currency for building same-page links (e.g. /produkt/x). */
export function restPathFromPathname(pathname) {
  const p = parseMarketPath(pathname || "");
  if (p) return p.rest === "" ? "/" : p.rest;
  const loc = (pathname || "").match(INTERNAL_LOCALE_PREFIX);
  if (loc) {
    const rest = pathname.slice(loc[0].length) || "/";
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname || "/";
}
