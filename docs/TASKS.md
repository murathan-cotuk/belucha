# 📋 Yapılacaklar Listesi

> **Not:** Tüm düzeltmeler, açıklamalar ve yapılacaklar bu dosyada toplanacak. Başka MD dosyası oluşturulmayacak.

## ✅ Tamamlananlar

1. ✅ Shop app Medusa client error handling iyileştirildi
2. ✅ Sellercentral Apollo Client hatası düzeltildi
3. ✅ GraphQL endpoint graceful error handling eklendi
4. ✅ Sellercentral SSR hatası düzeltildi (ApolloProvider client component'e taşındı)
5. ✅ Medusa backend build hatası düzeltildi (tsconfig.json ve build script güncellendi)
6. ✅ Medusa CLI hatası düzeltildi (server.js eklendi)
7. ✅ Medusa v2 API entegrasyonu eklendi (Express + loadMedusaApp)
8. ✅ Sellercentral isOpen prop hatası düzeltildi ($isOpen kullanıldı)
9. ✅ Footer ve LICENSE yılı dinamik yapıldı (2026)

---

## 🔧 ŞU ANKİ SORUNLAR VE ÇÖZÜMLER

### 1. Medusa Backend - .env.local Dosyası Düzeltildi ✅

**Sorun:** 
`.env.local` dosyasında çift tanımlamalar vardı (DATABASE_URL, PORT, vs. iki kez tanımlanmış).

**Çözüm:**
- ✅ `.env.local` dosyası düzeltildi
- ✅ Çift tanımlamalar kaldırıldı
- ✅ Doğru format oluşturuldu (aşağıdaki "Doğru .env.local Formatı" bölümüne bak)

**Console Hataları (Normal - Medusa ile ilgili değil):**
- `Uncaught (in promise) Error: A listener indicated...` → Chrome DevTools hatası
- `Failed to load resource: 404` → DevTools bağlantı hatası  
- `Content Security Policy` → DevTools CSP hatası
- **Bu hatalar Medusa backend'in çalışmasını etkilemez, görmezden gelebilirsin**

---

### 2. Medusa Backend - ajv/dist/core Hatası

**Sorun:** 
```
Error: Cannot find module 'ajv/dist/core'
```

**Açıklama:** 
Medusa v2 başlatılırken `ajv` paketinin `dist/core` modülü bulunamıyor. Bu bir dependency sorunu.

**Çözüm:**
- Root'tan `npm install --legacy-peer-deps` çalıştır (zaman alabilir)
- Veya Medusa başlatılamazsa placeholder API'ler çalışıyor (şu an bu durumda)
- Local'de SQLite kullanılabilir (PostgreSQL gerekmez)

**Durum:** 
- ✅ Server çalışıyor (placeholder API'ler ile)
- ✅ `.env.local` dosyası düzeltildi
- ❌ Medusa v2 tam entegre değil (ajv hatası nedeniyle)

---

## 🚨 DEPLOY ÖNCESİ YAPILACAKLAR

### 1. Local Development - Medusa Backend

**Yapılacaklar:**
- [x] `.env.local` dosyası düzeltildi (`apps/medusa-backend/.env.local`)
- [ ] `ajv` dependency sorununu çöz:
  - Root'tan: `npm install --legacy-peer-deps` (uzun sürebilir)
  - Veya şimdilik placeholder API'ler ile devam et
- [ ] Medusa backend'i başlat:
  ```bash
  cd apps/medusa-backend
  npm start
  ```

**Açıklama:**
- Local'de SQLite kullanılabilir (PostgreSQL gerekmez)
- Medusa başlatılamazsa placeholder API'ler çalışır (shop app hata vermez)
- Production'da (Render) PostgreSQL kullanılacak

**Doğru `.env.local` Formatı:**
```env
# Medusa Backend - Local Development Environment Variables
# Dosya: apps/medusa-backend/.env.local

# Node Environment
NODE_ENV=development

# Server Configuration
PORT=9000
HOST=0.0.0.0

# Database Configuration (Local - SQLite kullanılıyor)
DATABASE_URL=file:./medusa.db
DATABASE_TYPE=sqlite

# CORS Configuration
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7001,http://localhost:3002

# Redis (Local development için opsiyonel - boş bırakılabilir)
# REDIS_URL=redis://localhost:6379

# JWT & Cookie Secrets (Local development için basit değerler)
JWT_SECRET=medusaSecretKey123456789012345678901234567890
COOKIE_SECRET=medusaCookieSecret123456789012345678901234567890

# Stripe (Opsiyonel - local'de gerekli değil)
# STRIPE_API_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

**Önemli Notlar:**
- ❌ **Çift tanımlama yapma!** (DATABASE_URL, PORT, vs. sadece bir kez tanımla)
- ✅ Local'de SQLite kullan (`DATABASE_URL=file:./medusa.db`)
- ✅ Production'da PostgreSQL kullanılacak (Render'da otomatik)
- ✅ JWT_SECRET ve COOKIE_SECRET en az 32 karakter olmalı
- ✅ ADMIN_CORS'a sellercentral URL'i de ekle (`http://localhost:3002`)

**Console Hataları (Normal):**
- `Uncaught (in promise) Error: A listener indicated...` → Chrome DevTools hatası, Medusa ile ilgili değil
- `Failed to load resource: 404` → DevTools bağlantı hatası, normal
- `Content Security Policy` → DevTools CSP hatası, normal
- Bu hatalar Medusa backend'in çalışmasını etkilemez

---

### 2. Render Environment Variables Düzeltmeleri

**Render Dashboard → belucha-medusa-backend → Environment:**

- [OK] **STORE_CORS** düzelt:
  - Şu anki: `https://belucha-shop.vercel.app/`
  - Olması gereken: `https://belucha-shop.vercel.app` (sonundaki `/` kaldır)

- [OK] **ADMIN_CORS** düzelt:
  - Şu anki: `https://belucha-medusa-backend.onrender.com`
  - Olması gereken: `https://belucha-medusa-backend.onrender.com/admin` (`/admin` ekle)

- [OK] **REDIS_URL** düzelt:
  - Şu anki: `<Redis Internal Redis URL>` (placeholder)
  - Olması gereken: **SİL** veya boş bırak (Redis yok)

- [OK] **DATABASE_URL** (opsiyonel):
  - Port ekle: `:5432` (hostname'den sonra)
  - Örnek: `postgresql://...@dpg-xxxxx-a:5432/medusa_seoj`

---

### 3. Vercel Environment Variables Kontrolü

**Vercel → Shop App → Settings → Environment Variables:**

- [ ] `NEXT_PUBLIC_MEDUSA_BACKEND_URL` var mı kontrol et
  - Şimdilik: `http://localhost:9000` (test için)
  - Render deploy edilince: `https://belucha-medusa-backend.onrender.com` (güncelle)

**Vercel → Sellercentral → Settings → Environment Variables:**

- [ ] `NEXT_PUBLIC_GRAPHQL_ENDPOINT` (opsiyonel, boş bırakabilirsin)

---

### 4. Render Deploy Kontrolü

**Render Dashboard → belucha-medusa-backend:**

- [ ] Build başarılı mı kontrol et (Logs sekmesi)
- [ ] Service çalışıyor mu kontrol et (Status: Available olmalı)
- [ ] Domain oluşturuldu mu kontrol et
- [ ] Health check çalışıyor mu (`/health` endpoint)
- [ ] **PORT binding hatası var mı kontrol et** (Logs'ta "No open ports detected" hatası varsa → `medusa-config.js` güncellendi, deploy sonrası düzelmeli)
- [ ] **Database connection hatası var mı kontrol et** (Logs'ta "Pg connection failed" hatası varsa → `DATABASE_URL` kontrol et)

---

### 5. Vercel Deploy Kontrolü

**Vercel Dashboard:**

- [ ] Shop App deploy başarılı mı?
- [ ] Sellercentral deploy başarılı mı?
- [ ] Build loglarında hata var mı kontrol et

---

### 6. Render Deploy Edildikten Sonra

**Render → belucha-medusa-backend → Settings → Networking:**

- [OK] Domain URL'ini kopyala (örn: `https://belucha-medusa-backend.onrender.com`)

**Vercel → Shop App → Environment Variables:**

- [OK] `NEXT_PUBLIC_MEDUSA_BACKEND_URL` değerini güncelle:
  - Eski: `http://localhost:9000`
  - Yeni: `https://belucha-medusa-backend.onrender.com` (Render'den aldığın URL)
- [ ] Save (Vercel otomatik redeploy eder)

---

## 🔍 Test Checklist

### Local Test:
- [OK] `npm run dev` çalışıyor mu?
- [OK] Shop app açılıyor mu? (http://localhost:3000)
- [OK] Sellercentral açılıyor mu? (http://localhost:3002)
- [ ] Hata var mı kontrol et (console, network)

### Production Test:
- [ ] Shop app Vercel'de açılıyor mu?
- [ ] Sellercentral Vercel'de açılıyor mu?
- [ ] Medusa backend Render'de çalışıyor mu?
- [ ] Shop app Medusa backend'e bağlanabiliyor mu?
- [ ] CORS hatası var mı kontrol et

---

## 🐛 Bilinen Sorunlar ve Çözümler

### Render Build Hatası:
- Root directory doğru mu? (`apps/medusa-backend`)
- Build command doğru mu? (`npm install && npm run build`)
- Logs'a bak: Web Service → Logs

### CORS Hatası:
- `STORE_CORS` ve `ADMIN_CORS` değerleri doğru mu?
- Vercel URL'leri doğru mu? (https:// ile başlamalı)
- Sonundaki `/` kaldırıldı mı?

### Database Bağlantı Hatası:
- `DATABASE_URL` doğru mu? (Internal Database URL kullan)
- PostgreSQL service çalışıyor mu?
- Port eklendi mi? (`:5432`)

### Medusa Backend Uyuyor (Sleep Mode):
- Free plan'da normal bir durum
- İlk istekte 10-30 saniye uyanma süresi olabilir
- Production için paid plan önerilir

---

## 📝 Notlar

- Render free plan'da sleep mode olabilir (15 dakika kullanılmazsa uyur)
- JWT_SECRET ve COOKIE_SECRET sadece Render'de olmalı, .env'e eklemeye gerek yok
- Environment variables değiştikten sonra Render otomatik redeploy eder
- Vercel environment variables değiştikten sonra otomatik redeploy eder

---

## 🎯 Öncelik Sırası

1. **Yüksek Öncelik:**
   - Render environment variables düzeltmeleri (STORE_CORS, ADMIN_CORS, REDIS_URL)
   - Render deploy başarılı mı kontrol et
   - Vercel environment variables kontrolü

2. **Orta Öncelik:**
   - Render domain oluştur
   - Vercel'de `NEXT_PUBLIC_MEDUSA_BACKEND_URL` güncelle
   - Test et (local ve production)

3. **Düşük Öncelik:**
   - Redis ekle (opsiyonel)
   - Health check ayarla
   - Custom domain ekle

---

---

## 📝 Notlar ve Açıklamalar

### Medusa Backend Yapısı
- **Local:** SQLite kullanılabilir (`file:./medusa.db`)
- **Production (Render):** PostgreSQL kullanılmalı
- **API Endpoints:**
  - `/health` - Health check
  - `/store/*` - Store API (products, carts, orders)
  - `/admin/*` - Admin API
- **Placeholder API'ler:** Medusa başlatılamazsa devreye girer (shop app hata vermez)

### Environment Variables
- **Local:** `apps/medusa-backend/.env.local` dosyasında
- **Render:** Dashboard → Environment sekmesinde
- **Vercel:** Settings → Environment Variables sekmesinde

### Git Workflow
1. `dev` branch'inde çalış
2. Test et
3. `main`'e merge et (sadece çalışan kodlar)
