# 📋 Yapılacaklar Listesi - Deploy Öncesi

## ✅ Tamamlananlar

1. ✅ Shop app Medusa client error handling iyileştirildi
2. ✅ Sellercentral Apollo Client hatası düzeltildi
3. ✅ GraphQL endpoint graceful error handling eklendi
4. ✅ Environment variables rehberi oluşturuldu
5. ✅ Render deployment rehberi hazırlandı
6. ✅ Sellercentral SSR hatası düzeltildi (ApolloProvider client component'e taşındı)
7. ✅ Medusa backend build hatası düzeltildi (tsconfig.json ve build script güncellendi)

---

## 🚨 DEPLOY ÖNCESİ YAPILACAKLAR

### 1. Render Environment Variables Düzeltmeleri

**Render Dashboard → belucha-medusa-backend → Environment:**

- [ ] **STORE_CORS** düzelt:
  - Şu anki: `https://belucha-shop.vercel.app/`
  - Olması gereken: `https://belucha-shop.vercel.app` (sonundaki `/` kaldır)

- [ ] **ADMIN_CORS** düzelt:
  - Şu anki: `https://belucha-medusa-backend.onrender.com`
  - Olması gereken: `https://belucha-medusa-backend.onrender.com/admin` (`/admin` ekle)

- [ ] **REDIS_URL** düzelt:
  - Şu anki: `<Redis Internal Redis URL>` (placeholder)
  - Olması gereken: **SİL** veya boş bırak (Redis yok)

- [ ] **DATABASE_URL** (opsiyonel):
  - Port ekle: `:5432` (hostname'den sonra)
  - Örnek: `postgresql://...@dpg-xxxxx-a:5432/medusa_seoj`

---

### 2. Vercel Environment Variables Kontrolü

**Vercel → Shop App → Settings → Environment Variables:**

- [ ] `NEXT_PUBLIC_MEDUSA_BACKEND_URL` var mı kontrol et
  - Şimdilik: `http://localhost:9000` (test için)
  - Render deploy edilince: `https://belucha-medusa-backend.onrender.com` (güncelle)

**Vercel → Sellercentral → Settings → Environment Variables:**

- [ ] `NEXT_PUBLIC_GRAPHQL_ENDPOINT` (opsiyonel, boş bırakabilirsin)

---

### 3. Render Deploy Kontrolü

**Render Dashboard → belucha-medusa-backend:**

- [ ] Build başarılı mı kontrol et (Logs sekmesi)
- [ ] Service çalışıyor mu kontrol et (Status: Available olmalı)
- [ ] Domain oluşturuldu mu kontrol et
- [ ] Health check çalışıyor mu (`/health` endpoint)

---

### 4. Vercel Deploy Kontrolü

**Vercel Dashboard:**

- [ ] Shop App deploy başarılı mı?
- [ ] Sellercentral deploy başarılı mı?
- [ ] Build loglarında hata var mı kontrol et

---

### 5. Render Deploy Edildikten Sonra

**Render → belucha-medusa-backend → Settings → Networking:**

- [ ] Domain URL'ini kopyala (örn: `https://belucha-medusa-backend.onrender.com`)

**Vercel → Shop App → Environment Variables:**

- [ ] `NEXT_PUBLIC_MEDUSA_BACKEND_URL` değerini güncelle:
  - Eski: `http://localhost:9000`
  - Yeni: `https://belucha-medusa-backend.onrender.com` (Render'den aldığın URL)
- [ ] Save (Vercel otomatik redeploy eder)

---

## 🔍 Test Checklist

### Local Test:
- [ ] `npm run dev` çalışıyor mu?
- [ ] Shop app açılıyor mu? (http://localhost:3000)
- [ ] Sellercentral açılıyor mu? (http://localhost:3002)
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

## 📚 Referanslar

- Render Deployment: `docs/RENDER_DEPLOYMENT_DETAYLI.md`
- Environment Variables: `docs/ENVIRONMENT_VARIABLES.md`
- Render Env Düzeltmeler: `docs/RENDER_ENV_DUZELTMELER.md`
