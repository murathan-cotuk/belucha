# Belucha E-Commerce Marketplace - Güncel Proje Durumu

## 📋 İçindekiler
1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Mimari ve Teknoloji Stack](#mimari-ve-teknoloji-stack)
3. [Monorepo Yapısı](#monorepo-yapısı)
4. [Uygulamalar Detaylı Açıklama](#uygulamalar-detaylı-açıklama)
5. [Payload CMS Collections](#payload-cms-collections)
6. [Environment Variables](#environment-variables)
7. [Deployment Durumu](#deployment-durumu)
8. [Mevcut Sorunlar ve Hatalar](#mevcut-sorunlar-ve-hatalar)
9. [Konfigürasyonlar](#konfigürasyonlar)
10. [Bağımlılıklar ve Versiyonlar](#bağımlılıklar-ve-versiyonlar)

---

## 🎯 Proje Genel Bakış

**Belucha**, Amazon benzeri bir e-ticaret marketplace platformudur. Üç ana bileşenden oluşur:

1. **Shop App**: Müşteri tarafı e-ticaret mağazası
2. **Sellercentral App**: Satıcı yönetim paneli (Amazon Seller Central benzeri)
3. **Payload CMS**: Headless CMS backend (GraphQL API)

**Proje Tipi**: Monorepo (Turborepo)
**Package Manager**: npm 9.5.0
**Node.js Versiyonu**: 18.20.8 (local), 22.21.1 (Railway production)

---

## 🏗️ Mimari ve Teknoloji Stack

### Frontend Teknolojileri
- **Next.js 16.0.10** (App Router)
- **React 19.2.3** (React 18'den yeni güncellendi)
- **React DOM 19.2.3**
- **Apollo Client 3.8.8** (GraphQL client)
- **Styled Components 6.1.6** (CSS-in-JS)
- **Tailwind CSS 3.4.0** (Utility-first CSS)
- **TypeScript 5.9.3** (Type checking - dev dependency)

### Backend Teknolojileri
- **Payload CMS 3.68.3** (Headless CMS)
- **Express 4.18.2** (HTTP server)
- **MongoDB 7.0.0** (Database driver)
- **Mongoose 8.15.1** (ODM - Payload tarafından kullanılıyor)
- **GraphQL** (Payload CMS GraphQL API)

### Database
- **MongoDB Atlas** (Cloud database)
- **Connection String**: `mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?appName=Belucha`

### Ödeme Sistemi
- **Stripe** (Payment processing)
- **Stripe Connect** (Seller payouts, 10% commission)

### Build Tools
- **Turborepo 2.6.1** (Monorepo build system)
- **Turbo** (Task runner)
- **ESBuild 0.25.0** (Bundler - override edilmiş)

### Diğer
- **Scheduler 0.27.0** (React 19 peer dependency)
- **Cross-env 7.0.3** (Environment variables)
- **Dotenv 16.3.1** (Environment file loading)

---

## 📁 Monorepo Yapısı

```
belucha/
├── apps/
│   ├── shop/                    # Müşteri mağazası (Port: 3000)
│   ├── sellercentral/            # Satıcı paneli (Port: 3002)
│   └── cms/
│       └── payload/              # Payload CMS backend (Port: 3001)
├── packages/
│   ├── ui/                      # Shared UI components
│   ├── lib/                     # Shared utilities (Apollo, Stripe, SEO)
│   └── config/                  # Shared configs (Tailwind, ESLint, TS)
├── package.json                 # Root package.json
├── package-lock.json            # Root lock file
├── turbo.json                   # Turborepo config
└── docs/                        # Documentation
```

### Workspace Yapısı
- `apps/*` - Uygulamalar
- `packages/*` - Shared packages
- `apps/cms/*` - CMS workspace (nested)

---

## 🚀 Uygulamalar Detaylı Açıklama

### 1. Shop App (`apps/shop`)

**Amaç**: Müşteri tarafı e-ticaret mağazası

**Port**: 3000 (development), production'da Vercel

**Deployment URL**: `https://belucha-shop.vercel.app`

**Özellikler**:
- Ana sayfa (Hero section + Product grid)
- Ürün detay sayfaları (`/product/[slug]`)
- Kategori sayfaları (`/category/[slug]`)
- Bestsellers (`/bestsellers`)
- Sale/Angebote (`/sale`)
- Recommended (`/recommended`)
- Müşteri hesabı (`/account`)
- Login/Register (`/login`, `/register`)

**Ana Bileşenler**:
- `Navbar.jsx` - Navigasyon çubuğu
- `SlimBar.jsx` - Üst ince bar
- `Hero.jsx` - Ana sayfa hero section
- `ProductGrid.jsx` - Ürün grid komponenti
- `Footer.jsx` - Footer
- `ProductTemplate.jsx` - Ürün detay template
- `CategoryTemplate.jsx` - Kategori template
- `ProtectedRoute.jsx` - Route koruma
- `Providers.jsx` - Apollo + Auth providers
- `AuthContext.jsx` - Authentication context

**Authentication**:
- JWT token tabanlı (localStorage)
- `localStorage.getItem("token")` - Customer token
- `localStorage.getItem("customerId")` - Customer ID
- `localStorage.getItem("customerLoggedIn")` - Login durumu

**GraphQL Endpoint**: `NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL` environment variable'dan alınıyor

**Apollo Client**: `packages/lib/src/apollo/client.js` kullanıyor (shared)

---

### 2. Sellercentral App (`apps/sellercentral`)

**Amaç**: Satıcı yönetim paneli (Amazon Seller Central benzeri)

**Port**: 3002 (development), production'da Vercel

**Deployment URL**: `https://belucha-sellercentral.vercel.app`

**Özellikler**:

#### Ana Menü Yapısı:
1. **Products** (Dropdown)
   - Inventory (`/inventory`) - Ana ürün listesi
   - Bulk Product Upload (`/products/bulk-upload`)
   - Upload Templates (`/products/upload-templates`)
   - Upload Images Bulk (`/products/bulk-images`)
   - Upload Videos Bulk (`/products/bulk-videos`)
   - Single Upload (`/products/single-upload`)

2. **Orders** (Dropdown)
   - Orders Dashboard (`/orders`)
   - Reports (`/orders/reports`)
   - Returns (`/orders/returns`)

3. **Advertise** (Dropdown)
   - Overview (`/advertise`)
   - Google Ads (`/advertise/google`)
   - Meta Ads (`/advertise/meta`)
   - TikTok Ads (`/advertise/tiktok`)
   - Pinterest Ads (`/advertise/pinterest`)

4. **Stores** (`/store`)
   - Amazon Stores benzeri landing page builder

5. **Brands** (`/brands`)
   - Marka yönetimi

6. **Analytics** (`/analytics`)
   - Genel raporlar ve analizler

7. **Apps** (`/apps`)
   - Entegre uygulamalar
   - API key yönetimi

8. **Settings** (Profile dropdown'dan)
   - Main Settings (`/settings`)
   - Account Settings (`/settings/account`)
   - Payment Settings (`/settings/payment`)
   - Notification Settings (`/settings/notifications`)
   - Security Settings (`/settings/security`)
   - Billing Settings (`/settings/billing`)

9. **Profile** (`/profile`)
   - Satıcı profil sayfası

**Ana Bileşenler**:
- `DashboardLayout.jsx` - Ana layout (sidebar + topbar)
  - Collapsible sidebar (ikonlar ortalanmış)
  - Top bar (arama çubuğu ortada, store name + profile icon sağda)
  - Profile dropdown menu
- `DashboardHome.jsx` - Dashboard ana sayfa
- `InventoryPage.jsx` - Ürün envanteri
- `SingleUploadPage.jsx` - Tek ürün yükleme
  - SKU (slug yerine) alanı
  - Kategori seçimi (dropdown + checkbox)
  - Product variants (color, size, material, etc.)
  - Variant options (value, SKU, price, inventory)
- `BulkUploadPage.jsx` - Toplu ürün yükleme (Excel template)
- `OrdersPage.jsx` - Sipariş yönetimi
- `AdvertisePage.jsx` - Reklam yönetimi
- `StorePage.jsx` - Store builder
- `BrandPage.jsx` - Marka yönetimi
- `AnalyticsPage.jsx` - Analitik
- `AppsPage.jsx` - Uygulama yönetimi
- `ProfilePage.jsx` - Profil
- `SettingsPage.jsx` - Ayarlar

**Authentication**:
- JWT token tabanlı (localStorage)
- `localStorage.getItem("token")` - Seller token
- `localStorage.getItem("sellerId")` - Seller ID
- `localStorage.getItem("sellerLoggedIn")` - Login durumu
- Login sayfasında seller account kontrolü yapılıyor

**GraphQL Mutations**:
- `CREATE_PRODUCT` - Ürün oluşturma
- `GET_SELLER` - Satıcı bilgisi
- `GET_CATEGORIES` - Kategori listesi

**Önemli Özellikler**:
- Logo tıklanınca dashboard'a (`/`) yönlendiriyor
- Sidebar collapse edilebilir (ikonlar ortalanmış)
- Store name top bar'da gösteriliyor (email değil)
- Kategori seçimi: Dropdown + checkbox (multi-select)
- SKU otomatik oluşturuluyor (title'dan uppercase)

---

### 3. Payload CMS (`apps/cms/payload`)

**Amaç**: Headless CMS backend (GraphQL API)

**Port**: 3001 (development), Railway production

**Deployment URL**: `https://belucha-cms.railway.app` (Railway auto-generated)
**Override URL**: `https://beluchacms-production.up.railway.app` (PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE)

**Özellikler**:
- GraphQL API (`/api/graphql`)
- Admin Panel (`/admin`)
- REST API (`/api`)
- Health Check (`/health`)

**Server Yapısı** (`src/server.js`):
- Express app
- CORS middleware (localhost + production URLs)
- Payload init
- Health endpoint

**Config Yapısı** (`src/payload.config.js`):
- MongoDB adapter (mongoose)
- Lexical editor
- 7 collection
- GraphQL enabled
- CORS settings
- Server URL override mekanizması

**Collections**:
1. Products
2. Categories
3. Brands
4. Sellers (auth enabled)
5. Customers
6. Orders
7. Media

**Scripts**:
- `seed:categories` - Amazon kategorilerini seed etme

**Önemli Notlar**:
- `.env.local` dosyası local development için kullanılıyor
- Production'da Railway environment variables kullanılıyor
- `PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE` Railway'in auto-generated URL'ini override ediyor

---

## 📊 Payload CMS Collections

### 1. Products Collection

**Slug**: `products`

**Fields**:
- `title` (text, required)
- `slug` (text, required, unique)
- `description` (richText)
- `price` (number, required, min: 0)
- `compareAtPrice` (number, min: 0)
- `sku` (text, unique) - **ÖNEMLİ**: Sellercentral'da "SKU" olarak gösteriliyor
- `images` (array of uploads, relationTo: 'media')
- `category` (relationship, hasMany: true, relationTo: 'categories')
- `brand` (relationship, relationTo: 'brands')
- `seller` (relationship, required, relationTo: 'sellers')
- `inventory` (number, required, defaultValue: 0, min: 0)
- `variants` (array) - Product variants
  - `name` (text, required) - Variant adı (Color, Size, Material, etc.)
  - `options` (array)
    - `value` (text, required) - Variant değeri
    - `sku` (text) - Variant SKU
    - `price` (number) - Variant fiyat override
    - `inventory` (number, defaultValue: 0) - Variant stok
    - `image` (upload, relationTo: 'media') - Variant görseli
- `weight` (number) - Ağırlık (kg)
- `dimensions` (group)
  - `length` (number) - Uzunluk (cm)
  - `width` (number) - Genişlik (cm)
  - `height` (number) - Yükseklik (cm)
- `status` (select: 'draft', 'published', 'archived', defaultValue: 'draft')
- `featured` (checkbox, defaultValue: false)
- `bestseller` (checkbox, defaultValue: false)

**Access Control**:
- Read: Public
- Create: Public
- Update: Public
- Delete: Public

---

### 2. Categories Collection

**Slug**: `categories`

**Fields**:
- `name` (text, required)
- `slug` (text, required, unique)
- `parent` (relationship, relationTo: 'categories') - Hierarchical structure

**Özellikler**:
- Amazon benzeri kategori yapısı
- Seed script ile dolduruluyor (`seed:categories`)
- Nested/hierarchical yapı destekleniyor

**Seed Script**: `src/scripts/seed-amazon-categories.js`
- Amazon kategorilerini MongoDB'ye ekliyor
- İki aşamalı: Önce parent'lar, sonra child'lar

---

### 3. Brands Collection

**Slug**: `brands`

**Fields**:
- `name` (text, required)
- `slug` (text, required, unique)
- `description` (textarea)
- `logo` (upload, relationTo: 'media')

---

### 4. Sellers Collection

**Slug**: `sellers`

**Auth**: Enabled (JWT token based)

**Fields**:
- `storeName` (text, required) - **ÖNEMLİ**: Sellercentral'da gösteriliyor
- `slug` (text, required, unique)
- `description` (textarea)
- `logo` (upload, relationTo: 'media')
- `banner` (upload, relationTo: 'media')
- `stripeAccountId` (text) - Stripe Connect account ID
- `commissionRate` (number, defaultValue: 10) - Komisyon oranı (%)
- `status` (select: 'pending', 'active', 'suspended', defaultValue: 'pending')
- `googleId` (text) - Google OAuth ID

**Access Control**:
- Read: Public
- Create: Public
- Update: Sadece kendi kaydını güncelleyebilir
- Delete: Disabled

**Özellikler**:
- Seller registration ücretsiz
- 10% komisyon oranı (default)
- Stripe Connect entegrasyonu

---

### 5. Customers Collection

**Slug**: `customers`

**Fields**:
- Customer profile fields (detaylar eksik)

**Access Control**:
- Read: Public
- Create: Public
- Update: Public
- Delete: Public

---

### 6. Orders Collection

**Slug**: `orders`

**Fields**:
- Order fields (detaylar eksik)
- Commission tracking

**Access Control**:
- Read: Public
- Create: Public
- Update: Public
- Delete: Public

---

### 7. Media Collection

**Slug**: `media`

**Fields**:
- File uploads
- Images, videos, documents

**Storage**: Local storage (production'da cloud storage'a geçilebilir)

---

## 🔐 Environment Variables

### Local Development

#### `apps/cms/payload/.env.local`
```env
PAYLOAD_SECRET=beluchaSecret123456789012345678901234567890
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
PORT=3001
DATABASE_URI=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?appName=Belucha
PAYLOAD_MONGO_URL=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
```

#### `apps/shop/.env.local`
```env
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=http://localhost:3001/api/graphql
NEXT_PUBLIC_SELLERCENTRAL_URL=http://localhost:3002
```

#### `apps/sellercentral/.env.local`
```env
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=http://localhost:3001/api/graphql
```

### Production (Vercel)

#### Shop App (`belucha-shop.vercel.app`)
```env
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://beluchacms-production.up.railway.app/api/graphql
NEXT_PUBLIC_SELLERCENTRAL_URL=https://belucha-sellercentral.vercel.app
```

#### Sellercentral App (`belucha-sellercentral.vercel.app`)
```env
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://beluchacms-production.up.railway.app/api/graphql
```

### Production (Railway)

#### Payload CMS (`belucha-cms.railway.app`)
```env
PAYLOAD_SECRET=beluchaSecret123456789012345678901234567890
PAYLOAD_PUBLIC_SERVER_URL=https://belucha-cms.railway.app
PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE=https://beluchacms-production.up.railway.app
DATABASE_URI=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?appName=Belucha
PAYLOAD_MONGO_URL=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
PORT=3001
```

**Önemli Notlar**:
- Railway otomatik olarak `PAYLOAD_PUBLIC_SERVER_URL` oluşturuyor (`https://belucha-cms.railway.app`)
- Override için `PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE` kullanılıyor
- MongoDB password: `belucha`
- MongoDB cluster: `belucha.dijx1dj.mongodb.net`

---

## 🚢 Deployment Durumu

### Vercel Deployment

#### Shop App
- **Status**: ✅ Deployed
- **URL**: `https://belucha-shop.vercel.app`
- **Root Directory**: `apps/shop`
- **Build Command**: `npm run build`
- **Framework**: Next.js

#### Sellercentral App
- **Status**: ✅ Deployed
- **URL**: `https://belucha-sellercentral.vercel.app`
- **Root Directory**: `apps/sellercentral`
- **Build Command**: `npm run build`
- **Framework**: Next.js

### Railway Deployment

#### Payload CMS
- **Status**: ⚠️ Partial (GraphQL route 404 hatası var)
- **URL**: `https://belucha-cms.railway.app`
- **Override URL**: `https://beluchacms-production.up.railway.app`
- **Service Name**: `@belucha/cms`
- **Start Command**: `node src/server.js`
- **Build Command**: `npm run build` (skipped - echo only)
- **Node Version**: 22.21.1 (Railway default)

**Railway Build Process**:
1. `npm ci` - Clean install
2. `npm run build --workspace=@belucha/cms` - Build (skipped)
3. `npm run start --workspace=@belucha/cms` - Start server

**Railway Environment Variables**:
- Railway otomatik olarak `RAILWAY_PROJECT_NAME`, `RAILWAY_ENVIRONMENT_NAME`, `RAILWAY_SERVICE_NAME` gibi değişkenler ekliyor
- `PAYLOAD_PUBLIC_SERVER_URL` Railway tarafından otomatik set ediliyor (değiştirilemiyor)

---

## ❌ Mevcut Sorunlar ve Hatalar

### 1. GraphQL API 404 Hatası (KRİTİK)

**Sorun**: Payload CMS GraphQL endpoint'i (`/api/graphql`) 404 döndürüyor.

**Lokasyon**: Hem local hem production

**Belirtiler**:
- `Cannot GET /api/graphql` hatası
- Sellercentral'da kategori listesi yüklenemiyor
- Product upload çalışmıyor
- GraphQL queries başarısız

**Neden**:
- Payload CMS v3.68.3'te route registration sorunu olabilir
- Express app'e route'lar kaydedilmiyor
- `payload.init()` başarılı ama route'lar register olmuyor

**Çözüm Denemeleri**:
1. ✅ `admin.path: '/admin'` explicit olarak eklendi
2. ✅ `routes` config'de explicit tanımlandı
3. ✅ CORS middleware düzeltildi
4. ✅ Health endpoint eklendi
5. ❌ Route registration hala çalışmıyor

**Önerilen Çözüm**:
- Payload CMS'i `@latest` versiyona güncelle
- Veya Payload CMS v3 dokümantasyonunu kontrol et

---

### 2. Admin Panel 404 Hatası

**Sorun**: Payload CMS admin panel (`/admin`) 404 döndürüyor.

**Lokasyon**: Hem local hem production

**Neden**: GraphQL route sorunu ile aynı (route registration)

---

### 3. Package Lock File Senkronizasyon Sorunu

**Sorun**: Railway'de `npm ci` hatası - `package-lock.json` ile `package.json` senkronize değil.

**Çözüm**: ✅ Düzeltildi
- React 19.2.3 eklendi (Next.js 16.0.10 gerektiriyor)
- TypeScript 5.9.3 eklendi
- Scheduler 0.27.0 eklendi (React 19 peer dependency)
- `package-lock.json` güncellendi

---

### 4. Node.js Versiyon Uyarıları

**Sorun**: Railway'de Node.js 22.21.1 kullanılıyor, bazı paketler Node 20.19.0+ gerektiriyor.

**Etkilenen Paketler**:
- `bson@7.0.0` - Node >=20.19.0
- `mongodb@7.0.0` - Node >=20.19.0
- `next@16.0.10` - Node >=20.9.0
- `undici@7.10.0` - Node >=20.18.1

**Durum**: ⚠️ Uyarı (çalışıyor ama uyarı veriyor)

---

### 5. Kategori Seed Sorunu

**Sorun**: Kategoriler MongoDB'de yok.

**Çözüm**: ✅ Script hazır
```bash
cd apps/cms/payload
npm run seed:categories
```

**Not**: Script `.env.local` dosyasını yüklüyor, environment variables'ı kontrol ediyor.

---

### 6. Seller Account Görünmüyor

**Sorun**: Oluşturulan seller account MongoDB'de görünmüyor.

**Neden**: GraphQL API çalışmadığı için seller oluşturulamıyor veya görüntülenemiyor.

**Çözüm**: GraphQL API sorunu çözülünce düzelecek.

---

## ⚙️ Konfigürasyonlar

### Turborepo Config (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
    },
    "@belucha/cms#build": {
      "cache": false,
      "outputs": [],
      "dependsOn": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Özellikler**:
- `.env.local` dosyaları global dependency olarak tanımlanmış
- CMS build cache'lenmiyor
- Dev task persistent (sürekli çalışıyor)

---

### Next.js Config

**Shop & Sellercentral** (`next.config.js`):
```javascript
{
  reactStrictMode: true,
  transpilePackages: ["@belucha/ui", "@belucha/lib"],
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'cdnjs.cloudflare.com' },
    ],
  },
  experimental: {
    turbo: {
      root: path.resolve(__dirname, '../../..'), // Monorepo root
    },
  },
}
```

**Özellikler**:
- Styled Components compiler enabled
- Shared packages transpile ediliyor
- Turbopack root monorepo root'a set edilmiş (Türkçe karakter sorunu için)

---

### Payload CMS Config

**Routes**:
- Admin: `/admin`
- API: `/api`
- GraphQL: `/api/graphql`

**CORS Allowed Origins**:
- `http://localhost:3000` (Shop)
- `http://localhost:3002` (Sellercentral)
- `https://belucha-shop.vercel.app`
- `https://belucha-sellercentral.vercel.app`
- `https://sellercentral.vercel.app`
- `https://belucha-cms.railway.app`
- `https://beluchacms-production.up.railway.app`

**Server URL Priority**:
1. `PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE` (Railway override)
2. `PAYLOAD_PUBLIC_SERVER_URL` (Railway auto-generated)
3. `http://localhost:3001` (Local fallback)

---

## 📦 Bağımlılıklar ve Versiyonlar

### Root Dependencies
```json
{
  "dependencies": {
    "cross-env": "^7.0.3",
    "next": "16.0.10",
    "scheduler": "^0.27.0"
  },
  "devDependencies": {
    "@turbo/gen": "^2.6.1",
    "prettier": "^3.0.0",
    "turbo": "^2.6.1"
  },
  "packageManager": "npm@9.5.0"
}
```

### Shop & Sellercentral Dependencies
```json
{
  "dependencies": {
    "@apollo/client": "^3.8.8",
    "@belucha/lib": "*",
    "@belucha/ui": "*",
    "autoprefixer": "^10.4.16",
    "graphql": "^16.8.1",
    "next": "16.0.10",
    "postcss": "^8.4.32",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "styled-components": "^6.1.6",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@belucha/config": "*",
    "eslint": "^9.0.0",
    "eslint-config-next": "16.0.10",
    "typescript": "^5.9.3"
  }
}
```

### Payload CMS Dependencies
```json
{
  "dependencies": {
    "@payloadcms/db-mongodb": "^3.68.3",
    "@payloadcms/plugin-stripe": "3.68.3",
    "@payloadcms/richtext-lexical": "^3.68.3",
    "cross-env": "^7.0.3",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mongodb": "^7.0.0",
    "payload": "^3.68.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

**Önemli Versiyonlar**:
- **Payload CMS**: 3.68.3 (tüm @payloadcms paketleri aynı versiyon)
- **Next.js**: 16.0.10
- **React**: 19.2.3 (yeni güncellendi)
- **Apollo Client**: 3.8.8
- **MongoDB Driver**: 7.0.0
- **TypeScript**: 5.9.3

---

## 🔄 Son Yapılan Değişiklikler

### 1. React 19.2.3 Güncellemesi
- Shop ve Sellercentral'da React 18'den 19.2.3'e güncellendi
- Next.js 16.0.10 React 19 gerektiriyor

### 2. TypeScript 5.9.3 Eklendi
- Shop ve Sellercentral'a TypeScript dev dependency olarak eklendi
- Next.js 16.0.10 TypeScript 5.9.3 gerektiriyor

### 3. Scheduler 0.27.0 Eklendi
- Root package.json'a eklendi
- React 19 peer dependency

### 4. Package Lock File Güncellendi
- `npm install` çalıştırıldı
- Tüm bağımlılıklar senkronize edildi

### 5. SKU Alanı Değişikliği
- Product creation'da "slug" yerine "SKU" gösteriliyor
- Backend'de hala `sku` field'ı kullanılıyor

### 6. Kategori Seçimi İyileştirildi
- Multi-select dropdown yerine checkbox dropdown
- "Hold Ctrl..." metni kaldırıldı

### 7. Dashboard Layout İyileştirmeleri
- Collapsible sidebar
- Top bar (arama + store name)
- Profile dropdown menu

---

## 🎯 Öncelikli Yapılacaklar

### 1. GraphQL API Sorununu Çöz (KRİTİK)
- Payload CMS route registration sorununu çöz
- `/api/graphql` endpoint'ini çalışır hale getir
- `/admin` panel'ini çalışır hale getir

### 2. Kategori Seed'i Çalıştır
- MongoDB'ye kategorileri ekle
- Sellercentral'da kategori seçimini test et

### 3. Seller Account Test Et
- Seller oluşturmayı test et
- Seller login'i test et
- Sellercentral'da seller bilgilerini görüntülemeyi test et

### 4. Product Upload Test Et
- Single upload'u test et
- Bulk upload'u test et
- Variant'ları test et

### 5. Railway Deployment'i Düzelt
- GraphQL API sorununu çöz
- Admin panel'i çalışır hale getir
- Environment variables'ı kontrol et

---

## 📝 Notlar

1. **MongoDB Password**: `belucha` (production'da değiştirilmeli)
2. **PAYLOAD_SECRET**: `beluchaSecret123456789012345678901234567890` (production'da değiştirilmeli)
3. **Port Conflicts**: Local'de port 3001 kullanımda olabilir, `netstat` ile kontrol et
4. **Environment Variables**: `.env.local` dosyaları Git'e commit edilmemeli
5. **GraphQL API**: Şu anda çalışmıyor, kritik sorun
6. **Railway URL Override**: `PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE` kullanılıyor çünkü Railway'in auto-generated URL'i değiştirilemiyor

---

## 🔗 Önemli Linkler

- **Shop**: https://belucha-shop.vercel.app
- **Sellercentral**: https://belucha-sellercentral.vercel.app
- **Payload CMS (Railway)**: https://belucha-cms.railway.app
- **Payload CMS (Override)**: https://beluchacms-production.up.railway.app
- **GraphQL API**: https://beluchacms-production.up.railway.app/api/graphql (404)
- **Admin Panel**: https://belucha-cms.railway.app/admin (404)

---

**Son Güncelleme**: 2026-01-04
**Dokümantasyon Versiyonu**: 1.0.0

