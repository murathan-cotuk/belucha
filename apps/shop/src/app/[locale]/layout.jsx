import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import StyledComponentsRegistry from "../registry";
import Providers from "@/components/Providers";
import { MarketPrefixProvider } from "@/context/MarketPrefixContext";
import {
  marketPrefix,
  defaultMarketForLocale,
  defaultCurrencyForMarket,
} from "@/lib/shop-market";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  const h = await headers();
  const fromHeader = h.get("x-belucha-market-prefix");
  const market = defaultMarketForLocale(locale);
  const fallbackPrefix = marketPrefix(market, locale, defaultCurrencyForMarket(market));
  const marketPrefixValue =
    fromHeader && fromHeader.startsWith("/") ? fromHeader : fallbackPrefix;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <StyledComponentsRegistry>
        <MarketPrefixProvider value={marketPrefixValue}>
          <Providers>{children}</Providers>
        </MarketPrefixProvider>
      </StyledComponentsRegistry>
    </NextIntlClientProvider>
  );
}
