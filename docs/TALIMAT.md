Bu tasklarin yapilmasi lazim:

Belucha projesini production-ready hale getireceğiz. Şu sırayla ilerle:

ADIM 1 — i18n altyapısı:
- next-intl paketini hem shop hem sellercentral'a ekle
- [locale] prefix routing kur: EN (default), DE, TR, FR, IT, ES
- messages/ klasörü oluştur, her dil için JSON dosyaları hazırla
- middleware.ts kur, locale detection yap
- Mevcut Almanca route'ları (/kollektion, /produkt) yeni sisteme migrate et
- next.config.js güncelle

ADIM 2 — Checkout flow (shop):
- /cart sayfası oluştur
- /checkout sayfası oluştur (Stripe Elements entegrasyonu)
- /order/[id] sipariş onay sayfası oluştur
- packages/lib/stripe/client.js'i checkout'a bağla
- Medusa cart/checkout API endpoint'lerini kullan

ADIM 3 — server.js temizliği:
- Runtime link-modules patch'i kaldır
- Proper Medusa migration sistemi kur
- admin_hub_menus tablolarını migration'a taşı

Her adımı tamamlayınca bildir, onay verince sonrakine geç.
Önce ADIM 1'e başla.

Adim 1 i sanirim dün yapmistin. Lütfen tekrar kontrol et mevcut kurallari, api baglantilarini, sellercentral ve shop arasindaki baglantilarini ASLA AMA ASLA BOZMADAN gerekli yerden degisiklikleri yapmaya basla. SAKIN PROJEYI BOZMA!!!

10.03