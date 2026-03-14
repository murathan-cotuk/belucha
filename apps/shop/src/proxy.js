import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

/** Map country code (ISO 3166-1 alpha-2) to preferred locale. */
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

/** Prefer locale from geo or Accept-Language; set Accept-Language so next-intl uses it. */
function requestWithPreferredLocale(request) {
  const pathname = request.nextUrl.pathname || "";
  const hasLocaleInPath = LOCALES.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );
  if (hasLocaleInPath) return request;

  const geoLocale = getLocaleFromGeo(request);
  const acceptLanguage = request.headers.get("accept-language") || "";

  let preferred = geoLocale;
  if (!preferred && acceptLanguage) {
    const parts = acceptLanguage.split(",").map((s) => (s.split(";")[0] || "").trim());
    for (const part of parts) {
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
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/sale`, request.url)
    );
  }

  const requestToUse = requestWithPreferredLocale(request);
  return intlMiddleware(requestToUse);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
