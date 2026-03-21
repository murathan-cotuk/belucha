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

---

## 9. Sipariş Yönetim Sistemi (Orders Management)

### 9.1 İstek

Seller Central’da sipariş yönetimi tamamen olmadığı için kapsamlı bir sipariş paneli kurulması istendi:

- **Orders:** Excel benzeri tablo — sipariş numarası, müşteri adı, adres, tutar, bestellstatus, zahlungsstatus, lieferstatus, tarih, ülke, aksiyonlar
- Sipariş numarasına tıklanınca ayrı detay sayfası açılsın
- **Customers:** Müşteri listesi, müşteri detayları, sipariş geçmişi
- **Drafts:** Taslak siparişler
- **Abandoned Checkouts:** Tamamlanmamış sepetler
- **Returns:** İade talepleri — yeni iade oluştur, durum güncelle

Ayrıca:
- Siparişlere **100001’den başlayan sıralı sipariş numarası** eklenmesi
- Stripe’taki ödeme açıklamasına sipariş numarasının eklenmesi (`Siparis #100001`)
- Sipariş durum değişiklikleri (Bestellstatus, Zahlungsstatus, Lieferstatus) seller central’dan yönetilebilir olsun

---

### 9.2 Backend Değişiklikleri (`apps/medusa-backend/server.js`)

#### Yeni Veritabanı Sütunları — `store_orders`
```sql
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS order_number
  BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 100001 INCREMENT BY 1);
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS payment_status varchar(50) NOT NULL DEFAULT ‘bezahlt’;
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS delivery_status varchar(50) NOT NULL DEFAULT ‘offen’;
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS order_status varchar(50) NOT NULL DEFAULT ‘offen’;
```

#### Yeni Veritabanı Tablosu — `store_customers`
```sql
CREATE TABLE IF NOT EXISTS store_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text, last_name text, phone text,
  customer_number BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10001 INCREMENT BY 1),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
```

#### Yeni Veritabanı Tablosu — `store_returns`
```sql
CREATE TABLE IF NOT EXISTS store_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 200001 INCREMENT BY 1),
  order_id uuid REFERENCES store_orders(id) ON DELETE SET NULL,
  reason text, notes text, status varchar(50) DEFAULT ‘offen’,
  items jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
```

#### Stripe Entegrasyonu
Sipariş oluşturulduğunda (POST `/api/store-orders`) Stripe PaymentIntent güncelleniyor:
```js
await stripe.paymentIntents.update(paymentIntentId, {
  description: `Siparis #${orderNumber}`,
  metadata: { order_number: String(orderNumber), order_id: orderId },
})
```

#### Yeni Admin Hub Endpoint’leri
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/admin-hub/v1/orders` | Tüm siparişler. Query: `search`, `order_status`, `payment_status`, `delivery_status`, `sort`, `limit`, `offset`. |
| GET | `/admin-hub/v1/orders/:id` | Tek sipariş + line items (store_order_items JOIN). |
| PATCH | `/admin-hub/v1/orders/:id` | `order_status`, `payment_status`, `delivery_status` güncelle. |
| DELETE | `/admin-hub/v1/orders/:id` | Siparişi sil. |
| GET | `/admin-hub/v1/customers` | Siparişlerden türetilen müşteri listesi. Query: `search`, `limit`, `offset`. |
| GET | `/admin-hub/v1/customers/:email` | Tek müşteri + sipariş geçmişi. |
| GET | `/admin-hub/v1/abandoned-carts` | Sepeti var ama siparişi olmayan sepetler. |
| GET | `/admin-hub/v1/returns` | Tüm iade talepleri (order bilgileriyle JOIN). |
| POST | `/admin-hub/v1/returns` | Yeni iade oluştur. Body: `order_id`, `reason`, `notes`, `items`. |
| PATCH | `/admin-hub/v1/returns/:id` | İade durumu güncelle. |

---

### 9.3 Frontend Değişiklikleri (Seller Central)

#### `apps/sellercentral/src/lib/medusa-admin-client.js`
Eklenen metodlar: `getOrders(params)`, `getOrder(id)`, `updateOrder(id, data)`, `deleteOrder(id)`, `getCustomers(params)`, `getCustomer(email)`, `getAbandonedCarts()`, `getReturns()`, `createReturn(data)`, `updateReturn(id, data)`

#### `apps/sellercentral/src/components/pages/OrdersPage.jsx` — Tamamen Yeniden Yazıldı
- Excel benzeri tablo: expand toggle, #sipariş, Kunde, Adresse, Betrag, Bestellstatus, Zahlungsstatus, Lieferstatus, Datum, Land, aksiyonlar
- Arama input + 4 filtre dropdown (order_status, payment_status, delivery_status, sıralama)
- `StatusBadge` — renk kodlu durum etiketleri
- `ExpandedRow` — satır genişletince lazy-load ile ürün listesi + toplam
- `ActionMenu` (3 nokta) — versendet, zugestellt, abschließen, stornieren, löschen
- Inline durum güncelleme: `updateOrder` API çağrısı

#### `apps/sellercentral/src/components/pages/OrderDetailPage.jsx` — Tamamen Yeniden Yazıldı
- 2 sütunlu düzen: sol (ürün tablosu + durum yönetimi), sağ (müşteri kartı + adres + özet)
- 3 dropdown ile status güncelleme + "Status speichern" butonu
- Ürün tablosu: thumbnail, ürün adı, miktar, birim fiyat, toplam
- Stripe payment intent bilgisi
- Sipariş silme (kırmızı danger zone)
- Yeni route: `apps/sellercentral/src/app/[locale]/orders/[id]/page.jsx`

#### `apps/sellercentral/src/components/pages/CustomersPage.jsx` — Yeni
- Müşteri tablosu: Name, Email, Land, Bestellungen, Gesamtumsatz, Erster Kauf, Letzter Kauf
- 400ms debounce arama
- Satıra tıklayınca modal: müşteri detayları + istatistikler (order_count, total_spent) + sipariş geçmişi tablosu

#### `apps/sellercentral/src/components/pages/orders/AbandonedCheckoutsPage.jsx` — Yeni
- Tablo: Kunde, Email, Artikel sayısı, Wert, Erstellt, Zuletzt aktiv
- Satır genişletince ürün listesi (thumbnail + qty + fiyat)

#### `apps/sellercentral/src/components/pages/orders/OrdersReturnsPage.jsx` — Yeniden Yazıldı
- Tablo: return_number, order_number, müşteri, reason/notes, status badge, tarih, durum dropdown
- "Neue Rückgabe" butonu → modal form (Bestell-ID, Grund, Notizen)
- Satır bazlı anlık durum güncelleme

---

### 9.4 Durum Değerleri

| Alan | Değerler |
|------|---------|
| `order_status` | `offen`, `in_bearbeitung`, `abgeschlossen`, `storniert` |
| `payment_status` | `offen`, `bezahlt`, `teil_erstattet`, `erstattet` |
| `delivery_status` | `offen`, `versendet`, `zugestellt` |
| `return.status` | `offen`, `genehmigt`, `abgelehnt`, `abgeschlossen` |

---

### 9.5 Sipariş Numarası Akışı

```
[Müşteri] Checkout → Stripe ödeme tamamlandı
        │
        ▼
POST /api/store-orders  (shop backend proxy → medusa backend)
        │
        ▼
INSERT INTO store_orders → RETURNING order_number
  (IDENTITY sütunu otomatik 100001, 100002, ... verir)
        │
        ▼
stripe.paymentIntents.update(paymentIntentId, {
  description: "Siparis #100001",
  metadata: { order_number: "100001", order_id: "uuid" }
})
        │
        ▼
[Seller Central] Orders → tabloda #100001 görünür
  Siparis numarasına tıkla → /orders/{uuid} detay sayfası
```

---

### 9.6 Checkout Butonu Güncellemesi

`apps/shop/src/app/[locale]/checkout/page.jsx` içindeki "Place Order" butonu (`PayBtn`) kaldırıldı; yerine cart sayfasındaki `PayNowButton` bileşeni kullanıldı.

- **PayNowButton:** `apps/shop/src/components/ui/PayNowButton.jsx` — siyah (#1a1a1a) arka plan, hover’da yukarı kalkar, dönen ödeme ikonları animasyonu (kredi kartı → POS → para → cüzdan → ✓)
- `type="submit"` ve `style={{ width: "100%", marginTop: 20 }}` ile form submit butonu olarak kullanıldı
