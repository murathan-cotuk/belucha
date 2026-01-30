# 🚀 Render'e Medusa Backend Deploy Rehberi

## 📋 Ön Hazırlık

### 1. Render Hesabı
- Render.com'a git: https://render.com
- GitHub hesabınla giriş yap (ücretsiz plan var)

### 2. Medusa Backend Durumu
- Medusa backend şu anda monorepo içinde: `apps/medusa-backend`
- Render monorepo'yu destekler, root directory ayarlayabilirsin

---

## 🚀 Deploy Adımları

### Adım 1: Render'de Yeni Web Service Oluştur

1. Render Dashboard'a git
2. "New +" butonuna tıkla
3. "Web Service" seçeneğini seç
4. **Belucha monorepo'yu bağla** (GitHub repo'yu seç: murathan-cotuk/belucha)

### Adım 2: Build & Deploy Ayarları

**Name:** `belucha-medusa-backend` (veya istediğin isim)

**Region:** `Frankfurt` (veya en yakın bölge)

**Branch:** `main` (veya deploy etmek istediğin branch)

**Root Directory:** `apps/medusa-backend` ⚠️ **ÖNEMLİ!**

**Runtime:** `Node`

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

### Adım 3: PostgreSQL Database Ekle

1. Render Dashboard → "New +" → "PostgreSQL"
2. Name: `belucha-medusa-db` (veya istediğin isim)
3. Database: `medusa` (veya istediğin isim)
4. User: `medusa_user` (veya istediğin isim)
5. Region: Web service ile aynı bölgeyi seç
6. Plan: **Free** (veya istediğin plan)
7. "Create Database" tıkla

**PostgreSQL bilgileri:**
- Database oluşturulduktan sonra, "Connections" sekmesinden bilgileri al
- `Internal Database URL` ve `External Database URL` göreceksin

### Adım 4: Redis Ekle (Opsiyonel ama Önerilir)

1. Render Dashboard → "New +" → "Redis"
2. Name: `belucha-medusa-redis`
3. Region: Web service ile aynı bölgeyi seç
4. Plan: **Free** (veya istediğin plan)
5. "Create Redis" tıkla

**Redis bilgileri:**
- Redis oluşturulduktan sonra, "Connections" sekmesinden `Internal Redis URL` al

### Adım 5: Environment Variables Ekle

Web Service → Environment → "Add Environment Variable":

**Zorunlu Variables:**

```
DATABASE_URL=postgresql://medusa_user:EIUicZkgWtWBCTAyl0pXgLtzWTPK5BDM@dpg-d5uhghhr0fns73eqihug-a/medusa_seoj
DATABASE_TYPE=postgres
STORE_CORS=https://your-shop-app.vercel.app
ADMIN_CORS=https://your-admin.vercel.app
REDIS_URL=<Redis Internal Redis URL>
JWT_SECRET=<rastgele-bir-string-buraya>
COOKIE_SECRET=<rastgele-bir-string-buraya>
NODE_ENV=production
```

**Nasıl eklenir:**
1. Web Service → Environment
2. "Add Environment Variable" tıkla
3. Key ve Value gir
4. Save Changes

**Örnek:**
```
DATABASE_URL=postgresql://medusa_user:password@dpg-xxxxx-a.frankfurt-postgres.render.com/medusa
DATABASE_TYPE=postgres
STORE_CORS=https://belucha-shop.vercel.app
ADMIN_CORS=https://belucha-admin.vercel.app
REDIS_URL=rediss://default:password@dpg-xxxxx-a.frankfurt-redis.render.com:6379
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
COOKIE_SECRET=your-super-secret-cookie-key-here-min-32-chars
NODE_ENV=production
```

### Adım 6: Auto-Deploy Ayarları

1. Web Service → Settings → "Auto-Deploy"
2. "Auto-Deploy" açık olsun
3. Branch: `main` (veya deploy etmek istediğin branch)

### Adım 7: Domain Ayarla

1. Web Service → Settings → "Custom Domain"
2. "Generate Domain" tıkla (veya kendi domain'ini ekle)
3. Domain oluşturulur (örn: `belucha-medusa-backend.onrender.com`)
4. Bu URL'i kopyala

### Adım 8: Health Check (Opsiyonel)

1. Web Service → Settings → "Health Check Path"
2. Path: `/health` (Medusa'nın health endpoint'i)
3. Save Changes

### Adım 9: Vercel'de Environment Variable Güncelle

1. Vercel → Shop App → Settings → Environment Variables
2. `NEXT_PUBLIC_MEDUSA_BACKEND_URL` değerini güncelle:
   - Eski: `http://localhost:9000`
   - Yeni: `https://belucha-medusa-backend.onrender.com` (Render'den aldığın URL)
3. Save

---

## 📝 Özet Checklist

- [ ] Render'de yeni Web Service oluştur
- [ ] GitHub repo'yu bağla (belucha monorepo)
- [ ] Root Directory: `apps/medusa-backend` ayarla
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] PostgreSQL database ekle
- [ ] Redis ekle (opsiyonel)
- [ ] Environment variables ekle:
  - [ ] `DATABASE_URL` (PostgreSQL'den)
  - [ ] `DATABASE_TYPE=postgres`
  - [ ] `STORE_CORS` (Shop app Vercel URL'i)
  - [ ] `ADMIN_CORS` (Admin panel URL'i)
  - [ ] `REDIS_URL` (Redis'ten)
  - [ ] `JWT_SECRET` (random string, min 32 karakter)
  - [ ] `COOKIE_SECRET` (random string, min 32 karakter)
  - [ ] `NODE_ENV=production`
- [ ] Domain oluştur
- [ ] Vercel'de `NEXT_PUBLIC_MEDUSA_BACKEND_URL` güncelle

---

## 🔧 Medusa Backend Package.json Kontrolü

Medusa backend'in `package.json` dosyasında şu script'ler olmalı:

```json
{
  "scripts": {
    "dev": "...",
    "start": "npx @medusajs/cli start",
    "build": "npx @medusajs/cli build",
    "migrate": "npx @medusajs/cli migrations run"
  }
}
```

---

## ⚠️ Önemli Notlar

1. **Root Directory:** Render'de `apps/medusa-backend` olarak ayarla ⚠️
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. **CORS:** `STORE_CORS` ve `ADMIN_CORS` değerlerini Vercel URL'lerinle güncelle
5. **Database:** PostgreSQL Render'de ayrı bir service olarak oluşturulur
6. **Redis:** Opsiyonel ama önerilir (cache ve queue için)
7. **Free Plan:** Render'ın ücretsiz planı var, ama sleep mode olabilir (15 dakika kullanılmazsa uyur)
8. **JWT_SECRET ve COOKIE_SECRET:** En az 32 karakter olmalı, güçlü random string kullan

---

## 🆓 Render Free Plan Özellikleri

- ✅ PostgreSQL: 90 MB storage
- ✅ Redis: 25 MB storage
- ✅ Web Service: Sleep mode (15 dakika kullanılmazsa uyur, ilk istekte uyanır)
- ✅ Custom domain desteği
- ✅ Auto-deploy

**Sleep Mode:** Free plan'da web service 15 dakika kullanılmazsa uyur. İlk istekte uyanır (10-30 saniye sürebilir).

---

## 🐛 Sorun Giderme

### Build Hatası
- Root directory doğru mu? (`apps/medusa-backend`)
- Build command doğru mu? (`npm install && npm run build`)
- Logs'a bak: Web Service → Logs

### Database Bağlantı Hatası
- `DATABASE_URL` doğru mu? (Internal Database URL kullan)
- PostgreSQL service çalışıyor mu?
- Database oluşturuldu mu?

### CORS Hatası
- `STORE_CORS` ve `ADMIN_CORS` değerleri doğru mu?
- Vercel URL'leri doğru mu? (https:// ile başlamalı)

### Service Uyuyor (Sleep Mode)
- Free plan'da normal bir durum
- İlk istekte 10-30 saniye uyanma süresi olabilir
- Production için paid plan önerilir

---

## 📚 Daha Fazla Bilgi

- Render Docs: https://render.com/docs
- Medusa Docs: https://docs.medusajs.com
- Render Free Plan: https://render.com/docs/free

---

## 🎯 Hızlı Başlangıç

1. **Render → New + → Web Service**
2. **Repo:** belucha (monorepo)
3. **Root Directory:** `apps/medusa-backend`
4. **Build:** `npm install && npm run build`
5. **Start:** `npm start`
6. **PostgreSQL ekle** (ayrı service)
7. **Environment variables ekle**
8. **Deploy!**
