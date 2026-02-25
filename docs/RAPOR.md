# RAPOR — Net Talimat Uygulaması

## 1. Değiştirilen Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `apps/shop/src/components/templates/ProductTemplate.jsx` | Verkäufer: `product.metadata.seller_name` → `shop_name` → fallback `"Shop"` (reactive). data-seller-source="metadata" eklendi. |
| `apps/shop/src/components/TopBar.jsx` | İçerik ortalandı (`justify-content: center`). Dil seçici (DE) kaldırıldı. |
| `apps/shop/src/components/ShopHeader.jsx` | Navbar: Sadece scroll up'ta sticky; scroll down'da gizlenir. Compact 72→60px. Backdrop blur, Framer Motion (y animasyonu), hover underline, compact'ta güçlü gölge. |
| `apps/shop/src/design-system/tokens.js` | `navbar.heightCompact: "60px"` eklendi. |
| `apps/medusa-backend/server.js` | `GET /store/products?q=...` ile arama: `q` varsa title/description/handle üzerinde filtre, max 8 ürün döner. |
| `apps/shop/src/components/DropdownSearch.jsx` | Fallback: debounce 300ms, API `q` + limit 8, loading/no-result state, thumbnail + title + price, HighlightText (matched text bold). |

---

## 2. Eklenen / Kullanılan Endpoint'ler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/store/products?q=...&limit=8` | Arama: `q` parametresi varsa ürünler title, description, handle alanlarında filtrelenir; en fazla 8 ürün döner. Mevcut `storeProductsFromAdminHubGET` içinde implement edildi. |
| GET | `/store/collections` | Koleksiyon listesi (id, title, handle). Landing ve collection sayfaları için. |

---

## 3. Değiştirilen Component'ler

| Component | Özet |
|-----------|------|
| **ProductTemplate** | Verkäufer alanı artık sadece `product.metadata.seller_name` / `shop_name` / `"Shop"` ile render ediliyor; hardcoded yok. |
| **TopBar** | Ortalanmış tek satır; DE link kaldırıldı. |
| **ShopHeader** | Scroll yönüne göre görünür/gizli; görünürken scroll sonrası compact (60px); cam efekti; Framer Motion ile y animasyonu; link hover underline; compact iken gölge artıyor. |
| **DropdownSearch (fallback)** | 300ms debounce, `getProducts({ q, limit: 8 })`, loading/empty state, fiyat gösterimi, eşleşen metin bold. |

---

## 4. Store Name Akış Diyagramı

```
[Sellercentral] Settings → General → Store name kaydet
        │
        ▼
PATCH /admin-hub/seller-settings  { store_name: "..." }
        │
        ▼
DB: admin_hub_seller_settings (seller_id, store_name)
        │
        ▼
GET /store/products veya GET /store/products/:id
        │
        ▼
Backend: mapAdminHubToStoreProduct sonrası
         metadata.seller_name / shop_name yoksa
         getSellerStoreName(seller_id) ile DB'den doldurulur
        │
        ▼
Response: product.metadata.seller_name, product.metadata.shop_name
        │
        ▼
[Shop] ProductTemplate.jsx
         sellerName = product?.metadata?.seller_name
                   || product?.metadata?.shop_name
                   || "Shop"
        │
        ▼
"Verkäufer" label altında {sellerName} render
```

---

## 5. Search Akış Diyagramı

**Algolia yoksa (fallback):**

```
[User] Arama kutusuna yazar (min 2 karakter)
        │
        ▼
Frontend: 300ms debounce
        │
        ▼
GET /store/products?q=...&limit=8
        │
        ▼
Backend: listAdminHubProductsDb(limit: 200)
         → q varsa: title/description/handle ile filtre, slice(0, 8)
         → mapAdminHubToStoreProduct + seller_name enjeksiyonu
        │
        ▼
Response: { products, count }
        │
        ▼
Dropdown: loading → sonuçlar (thumbnail, title + highlight, price)
          sonuç yoksa: "Keine Ergebnisse für ..."
```

**Algolia varsa:** Mevcut InstantSearch + useSearchBox + useHits; index'te title, description, handle searchable ve ranking ayarları kontrol edilmeli.

---

## 6. Navbar Animasyon Mantığı

```
scrollY ≤ SCROLL_THRESHOLD (80px)
   → visible = true, compact = false
   → Header tam (72px), SubNav görünür, spacer 160px

scrollY > lastScrollY (aşağı kaydırma)
   → visible = false
   → Header animate y: "-100%" (Framer Motion spring)
   → Spacer 0

scrollY < lastScrollY (yukarı kaydırma) ve scrollY > 80
   → visible = true, compact = true
   → Header 60px, logo küçük, shadow artar, SubNav gizli
   → Spacer 100px
```

- **Cam efekti:** `backdrop-filter: blur(12px)`, `background: rgba(255,255,255,0.92)`.
- **Hover:** Nav linklerde `text-decoration: underline`.
- **Compact:** `tokens.navbar.heightCompact` (60px), `tokens.shadow.hover`.

---

## 7. Landing Page (Bölüm 2) — Eklenen / Değiştirilen Dosyalar

### Eklenen endpoint
- **GET /store/collections** — Admin Hub koleksiyon listesi (id, title, handle). Shop client: `getCollections()`.

### Eklenen dosyalar (landing component'ler)
| Dosya | Açıklama |
|-------|----------|
| `apps/shop/src/components/landing/HeroSection.jsx` | 70vh hero; sol metin, sağ 3D placeholder; alt yarı floating collection cards. Props: headline, subline, ctaText, ctaHref, collections. |
| `apps/shop/src/components/landing/CategoryShowcase.jsx` | 4–6 kategori grid; hover zoom; image overlay + başlık. Props: title, categories. |
| `apps/shop/src/components/landing/FlashSaleSection.jsx` | Turuncu badge, countdown (opsiyonel), yatay scroll ürün kartları, "Jetzt entdecken". Props: title, badgeText, ctaText, ctaHref, products, endDate. |
| `apps/shop/src/components/landing/FeaturedCollections.jsx` | 2x2 büyük banner. Props: title, collections. |
| `apps/shop/src/components/landing/SellerHighlight.jsx` | Grid: logo, ad, rating, "Zum Shop". Props: title, sellers (API bağlantı noktası açık). |
| `apps/shop/src/components/landing/TrustBar.jsx` | Schneller Versand, 30 Tage Rückgabe, Sichere Zahlung, Geprüfte Verkäufer. Props: items. |
| `apps/shop/src/components/landing/RecommendCarousel.jsx` | "Beliebt bei unseren Kunden" carousel. Props: title, products. |
| `apps/shop/src/components/landing/index.js` | Landing export. |

### Değiştirilen dosyalar
| Dosya | Değişiklik |
|-------|------------|
| `apps/shop/src/app/page.jsx` | Landing sırasına göre yeniden yapıldı: HeroSection → CategoryShowcase → FlashSaleSection → FeaturedCollections → SellerHighlight → TrustBar → RecommendCarousel. getCollections(), getCategories(), useMedusaProducts() ile veri. |
| `apps/shop/src/lib/medusa-client.js` | `getCollections()` eklendi (GET /store/collections). |

### Veri akışı (API bağlantı noktaları)
- **HeroSection / FeaturedCollections:** `getCollections()` → collections.
- **CategoryShowcase:** `getCategories()` veya collections fallback.
- **FlashSaleSection / RecommendCarousel:** `useMedusaProducts()` veya products prop.
- **SellerHighlight:** sellers prop (şu an boş; ileride seller API bağlanacak).
- **TrustBar:** Varsayılan sabit metin; isteğe göre items prop.

---

## 8. Sistem Kurulumu Raporu (Menü, Marka, GPSR, Header, Sepet, SEO, Rapor)

### 8.1 HTTP 404 Düzeltmesi
- **Sebep:** Shop `getCategories()` → `GET /store/categories` endpoint’i yoktu.
- **Yapılan:** `apps/medusa-backend/server.js` içinde `storeCategoriesGET` eklendi, `httpApp.get('/store/categories', storeCategoriesGET)` kaydedildi. `resolveAdminHub().getCategoryTree({ is_visible: true })` ile `{ categories, tree, count }` dönüyor; `slug` query destekleniyor.

### 8.2 Yeni Veritabanı Tabloları
| Tablo | Açıklama |
|-------|----------|
| `admin_hub_brands` | id, name, handle (UNIQUE), logo_image, address, created_at, updated_at |
| `store_carts` | id (uuid PK), created_at, updated_at |
| `store_cart_items` | id (uuid PK), cart_id (FK store_carts), variant_id, product_id, quantity, unit_price_cents, title, thumbnail, product_handle, created_at, updated_at |

### 8.3 Migration
- Migration tek blokta: `server.js` içinde `admin_hub_menus`, `admin_hub_menu_items`, `admin_hub_media`, `admin_hub_pages`, `admin_hub_collections`, `admin_hub_seller_settings`, `admin_hub_brands` sonrası `store_carts` ve `store_cart_items` CREATE TABLE IF NOT EXISTS ile ekleniyor. `idx_store_cart_items_cart_id` index’i eklendi.

### 8.4 Yeni Endpoint Listesi
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/store/categories` | Kategori ağacı (slug opsiyonel). |
| GET | `/admin-hub/brands` | Marka listesi. |
| POST | `/admin-hub/brands` | Marka oluştur (name, handle auto slugify, logo_image, address). |
| PATCH | `/admin-hub/brands/:id` | Marka güncelle. |
| DELETE | `/admin-hub/brands/:id` | Marka sil. |
| POST | `/store/carts` | Yeni sepet oluştur; `{ cart }` döner. |
| GET | `/store/carts/:id` | Sepet + line items. |
| POST | `/store/carts/:id/line-items` | Body: `variant_id`, `quantity`. Ürün/variant fiyatı backend’te çözülür. |
| PATCH | `/store/carts/:id/line-items/:lineId` | Body: `quantity`. 0 ise satır silinir. |
| DELETE | `/store/carts/:id/line-items/:lineId` | Satır silinir. |

### 8.5 Değiştirilen / Eklenen Frontend Bileşenleri
| Bileşen | Değişiklik |
|---------|------------|
| **ShopHeader** | Main/Second menü API’den (`getMenus()`); Kategorien dropdown + SubNav. SubNav gölge yok (banner ile birleşik). Sepet ikonu → sidebar açar (href kaldırıldı). Badge: `useCart().itemCount`. |
| **Navbar** | Menü/categories API; linkler `/kollektion/`, `/produkt/`. Sepet ikonu → sidebar açar; badge `itemCount`. |
| **ProductTemplate** | Slug: `params.slug ?? params.handle`. Canonical `/produkt/{handle}`. Marka: `meta.brand_name \|\| meta.brand`, logo varsa küçük. GPSR: "Produktsicherheitsinformationen" (hersteller, hersteller_information, verantwortliche_person_information) doluysa description altında. |
| **ProductCard** | Ürün linki `/produkt/{handle}`. `useCart().addToCart` (global sepet). |
| **DropdownSearch** | Hit linkleri ve `window.location.href` fallback: `/produkt/` kullanılıyor. |
| **Footer** | Linkler `/produkt/`, `/kollektion/`. |
| **CartContext** (yeni) | Global sepet state; cartId localStorage’da (`belucha_cart_id`). `addToCart`, `updateLineItem`, `removeLineItem`, `openCartSidebar`, `closeCartSidebar`, `itemCount`, `subtotalCents`. |
| **CartSidebar** (yeni) | Sağdan 420px drawer; overlay; liste (thumbnail, title, fiyat, adet +/-); ara toplam; "Versand: Wird an der Kasse berechnet"; "Zur Kasse" (→ /cart); "Warenkorb anzeigen" (→ /cart). Sepete eklemede otomatik açılmıyor. |
| **Providers** | `CartProvider` + `CartSidebar` eklendi. |
| **ProductEditPage** (Sellercentral) | Marka: Select (GET /admin-hub/brands). GPSR (opsiyonel): hersteller, hersteller_information, verantwortliche_person_information (metadata). |
| **BrandPage** (Sellercentral) | Liste + "Add Brand" modal (Name, Logo URL, Address; handle otomatik). CRUD: createBrand, deleteBrand. |

### 8.6 Cart State Yapısı
- **Kaynak:** `context/CartContext.jsx` (CartProvider).
- **Persist:** `localStorage` key `belucha_cart_id` → cart id. Sayfa yüklenince `getCart(cartId)` ile doldurulur.
- **API:** createCart → POST /store/carts; getCart → GET /store/carts/:id; addToCart → POST line-items; updateLineItem → PATCH line-items/:lineId; removeLineItem → DELETE line-items/:lineId.
- **Sidebar:** `sidebarOpen` state; sadece sepete tıklanınca açılır; ürün eklenince otomatik açılmaz.

### 8.7 Header Scroll Algoritması
- **atTop:** `scrollY <= 80` → Tam header (TopBar + Nav + SubNav), spacer 160px.
- **Scroll DOWN:** `visible = false`, header `translateY(-100%)`, spacer 0. Hiçbiri sticky değil.
- **Scroll UP:** Sadece navbar görünür (`visible = true`, `compact = true`); TopBar ve SubNav gizli. Spacer 72px veya 60px. Navbar yukarıdan kayarak gelir (Framer Motion).
- **Jitter önleme:** Scroll listener’da tek “ticking” guard; sabit spacer yükseklikleri; `transform translateY` kullanımı.

### 8.8 Menü Veri Akışı
```
[Sellercentral] Content → Menüs → main_menu / second_menu item’ları kaydet
        │
        ▼
DB: admin_hub_menus + admin_hub_menu_items
        │
        ▼
GET /store/menus  (location: main | second opsiyonel)
        │
        ▼
Response: { menus: [ { id, name, location, items: [ { id, label, link_type, link_value } ] } ] }
        │
        ▼
[Shop] ShopHeader / Navbar
        main_menu items → Kategorien dropdown (menuItemHref: collection → /kollektion/{value}, product → /produkt/{value})
        second_menu items → SubNav (SecondMenuRowInner); box-shadow: none
        │
        ▼
Save → Shop yenilendikten sonra aynı veri yansır (tek kaynak, DRY).
```

**Kullanılan endpoint:** `GET /store/menus`. **Bağlanan bileşenler:** ShopHeader (main + second), Navbar (main menü veya categories fallback).

### 8.9 SEO URL Yapısı
- **Ürün:** `/produkt/{handle}`. Route: `apps/shop/src/app/produkt/[handle]/page.jsx`. Canonical: `/produkt/{handle}`.
- **Koleksiyon:** `/kollektion/{handle}`. Route: `apps/shop/src/app/kollektion/[handle]/page.jsx`. Canonical: `/kollektion/{handle}`.
- Türkçe karakter slug: Backend’te handle/slug mevcut yapı ile; gerekirse slugify genişletilebilir.
- Eski route’lar (`/product/[slug]`, `/collections/[slug]`) duruyor; redirect eklenmedi.
