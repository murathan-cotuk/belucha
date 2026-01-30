# 🚂 Railway'e Medusa Backend Deploy Rehberi

## 📋 Ön Hazırlık

### 1. Railway Hesabı
- Railway.app'e git: https://railway.app
- GitHub hesabınla giriş yap

### 2. Medusa Backend Durumu
- Medusa backend şu anda monorepo içinde: `apps/medusa-backend`
- Railway monorepo'yu destekler, root directory ayarlayabilirsin

---

## 🚀 Deploy Adımları

### Adım 1: Railway'de Yeni Proje Oluştur

1. Railway Dashboard'a git
2. "New Project" butonuna tıkla
3. "Deploy from GitHub repo" seçeneğini seç
4. **Belucha monorepo'yu seç** (murathan-cotuk/belucha)
 
### Adım 2: Root Directory Ayarla

1. Proje oluşturulduktan sonra, Settings → Service → Root Directory
2. Root Directory'yi ayarla: `apps/medusa-backend`
3. Save

### Adım 3: Build & Start Commands

Settings → Deploy → Build Command:
```
npm install && npm run build
```

Settings → Deploy → Start Command:
```
npm start
```

### Adım 4: Environment Variables

Settings → Variables → Add Variable:

**Zorunlu Variables:**
```
DATABASE_URL=postgresql://... (Railway PostgreSQL otomatik ekler)
DATABASE_TYPE=postgres
STORE_CORS=https://your-shop-app.vercel.app
ADMIN_CORS=https://your-admin.vercel.app
REDIS_URL=redis://... (Railway Redis ekle)
JWT_SECRET=your-secret-key-here
COOKIE_SECRET=your-cookie-secret-here
```

**Nasıl eklenir:**
1. Railway → Project → Service → Variables
2. "New Variable" tıkla
3. Key ve Value gir
4. Save

### Adım 5: PostgreSQL Database Ekle

1. Railway → Project → "+ New" → Database → PostgreSQL
2. PostgreSQL otomatik oluşturulur
3. PostgreSQL → Variables → `DATABASE_URL` otomatik eklenir
4. Bu `DATABASE_URL`'i Medusa service'inin Variables'ına ekle

### Adım 6: Redis Ekle (Opsiyonel ama önerilir)

1. Railway → Project → "+ New" → Database → Redis
2. Redis otomatik oluşturulur
3. Redis → Variables → `REDIS_URL` otomatik eklenir
4. Bu `REDIS_URL`'i Medusa service'inin Variables'ına ekle

### Adım 7: Domain Ayarla

1. Railway → Service → Settings → Networking
2. "Generate Domain" tıkla
3. Domain oluşturulur (örn: `medusa-backend-production.up.railway.app`)
4. Bu URL'i kopyala

### Adım 8: Vercel'de Environment Variable Güncelle

1. Vercel → Shop App → Settings → Environment Variables
2. `NEXT_PUBLIC_MEDUSA_BACKEND_URL` değerini güncelle:
   - Eski: `http://localhost:9000`
   - Yeni: `https://medusa-backend-production.up.railway.app` (Railway'den aldığın URL)
3. Save

---

## 📝 Özet Checklist

- [ ] Railway'de yeni proje oluştur
- [ ] GitHub repo'yu bağla (belucha monorepo)
- [ ] Root Directory: `apps/medusa-backend` ayarla
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] PostgreSQL database ekle
- [ ] Redis ekle (opsiyonel)
- [ ] Environment variables ekle:
  - [ ] `DATABASE_URL` (PostgreSQL'den otomatik)
  - [ ] `DATABASE_TYPE=postgres`
  - [ ] `STORE_CORS` (Shop app Vercel URL'i)
  - [ ] `ADMIN_CORS` (Admin panel URL'i)
  - [ ] `REDIS_URL` (Redis'ten otomatik)
  - [ ] `JWT_SECRET` (random string)
  - [ ] `COOKIE_SECRET` (random string)
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

1. **Root Directory:** Railway'de `apps/medusa-backend` olarak ayarla
2. **Build Command:** `npm install && npm run build` (monorepo için)
3. **Start Command:** `npm start`
4. **CORS:** `STORE_CORS` ve `ADMIN_CORS` değerlerini Vercel URL'lerinle güncelle
5. **Database:** PostgreSQL Railway'de otomatik oluşturulur, `DATABASE_URL` otomatik eklenir
6. **Redis:** Opsiyonel ama önerilir (cache ve queue için)

---

## 🐛 Sorun Giderme

### Build Hatası
- Root directory doğru mu? (`apps/medusa-backend`)
- Build command doğru mu? (`npm install && npm run build`)

### Database Bağlantı Hatası
- `DATABASE_URL` doğru mu?
- PostgreSQL service çalışıyor mu?

### CORS Hatası
- `STORE_CORS` ve `ADMIN_CORS` değerleri doğru mu?
- Vercel URL'leri doğru mu?

---

## 📚 Daha Fazla Bilgi

- Railway Docs: https://docs.railway.app
- Medusa Docs: https://docs.medusajs.com
