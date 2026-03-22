import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  parseMarketPath,
  defaultMarketForLocale,
  DEFAULT_CURRENCY,
  isValidLocale,
  marketPrefix,
} from "./lib/shop-market";

const LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;
const defaultMarketPath = () => {
  const lang = DEFAULT_LOCALE || "en";
  const m = defaultMarketForLocale(lang);
  return `/${m}/${lang}/${DEFAULT_CURRENCY}`;
};

/** Map geo country → preferred language (not market code). */
const COUNTRY_TO_LOCALE = {
  DE: "de",
  AT: "de",
  CH: "de",
  TR: "tr",
  FR: "fr",
  ES: "es",
  IT: "it",
  GB: "en",
  US: "en",
  EN: "en",
};

function getLocaleFromGeo(request) {
  const country =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    "";
  const code = (country || "").toUpperCase();
  if (COUNTRY_TO_LOCALE[code] && LOCALES.includes(COUNTRY_TO_LOCALE[code])) {
    return COUNTRY_TO_LOCALE[code];
  }
  return null;
}

function requestWithPreferredLocale(request) {
  const pathname = request.nextUrl.pathname || "";
  const parts = pathname.split("/").filter(Boolean);
  if (parseMarketPath(pathname)) return request;
  if (parts.length >= 1 && isValidLocale(parts[0])) return request;

  const geoLocale = getLocaleFromGeo(request);
  const acceptLanguage = request.headers.get("accept-language") || "";

  let preferred = geoLocale;
  if (!preferred && acceptLanguage) {
    const acc = acceptLanguage.split(",").map((s) => (s.split(";")[0] || "").trim());
    for (const part of acc) {
      const lang = (part.split("-")[0] || "").toLowerCase();
      if (LOCALES.includes(lang)) {
        preferred = lang;
        break;
      }
    }
  }
  if (!preferred) return request;

  const newHeaders = new Headers(request.headers);
  newHeaders.set("accept-language", `${preferred},${acceptLanguage}`);

  return new NextRequest(request.url, {
    method: request.method,
    headers: newHeaders,
  });
}

const intlMiddleware = createMiddleware(routing);

export default function middleware(request) {
  const pathname = request.nextUrl.pathname || "";

  if (pathname === "/sale" || pathname === "/sale/") {
    return NextResponse.redirect(new URL(`${defaultMarketPath()}/sale`, request.url));
  }

  const triple = parseMarketPath(pathname);
  if (triple) {
    const internal =
      !triple.rest || triple.rest === "/"
        ? `/${triple.lang}`
        : `/${triple.lang}${triple.rest}`;
    const u = request.nextUrl.clone();
    u.pathname = internal;
    const h = new Headers(request.headers);
    h.set(
      "x-belucha-market-prefix",
      marketPrefix(triple.country, triple.lang, triple.currency)
    );
    const forwarded = new NextRequest(u, {
      headers: h,
      method: request.method,
    });
    return intlMiddleware(forwarded);
  }

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 1 && isValidLocale(parts[0])) {
    const loc = parts[0].toLowerCase();
    const rest = parts.length > 1 ? `/${parts.slice(1).join("/")}` : "";
    const market = defaultMarketForLocale(loc);
    const url = new URL(`/${market}/${loc}/${DEFAULT_CURRENCY}${rest}`, request.url);
    return NextResponse.redirect(url);
  }

  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL(defaultMarketPath(), request.url));
  }

  const requestToUse = requestWithPreferredLocale(request);
  return intlMiddleware(requestToUse);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|monitoring|.*\\..*).*)"],
};
