# Environment Variables Rehberi

Bu dosya, Belucha projesinde kullanılan tüm environment variables'ları açıklar.

## 📋 Genel Bakış

### Shop App (apps/shop)
- **NEXT_PUBLIC_MEDUSA_BACKEND_URL**: Medusa backend URL'i

### Sellercentral (apps/sellercentral)
- **NEXT_PUBLIC_GRAPHQL_ENDPOINT**: GraphQL API endpoint (opsiyonel, şimdilik yok)

---

## 🏠 Local Development (.env.local)

### Shop App

**Dosya:** `apps/shop/.env.local`

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

### Sellercentral

**Dosya:** `apps/sellercentral/.env.local`

```env
# GraphQL endpoint şimdilik yok, boş bırakabilirsin
# NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

---

## ☁️ Vercel Production

### Shop App Projesi

1. Vercel Dashboard → **Shop App** projesi → Settings → Environment Variables
2. Add New:
   - **Key:** `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
   - **Value:** 
     - Şimdilik: `http://localhost:9000` (test için)
     - Medusa deploy edilince: `https://your-medusa-backend.railway.app`
   - **Environment:** Production, Preview, Development (hepsini seç)
3. Save

### Sellercentral Projesi

1. Vercel Dashboard → **Sellercentral** projesi → Settings → Environment Variables
2. Add New (opsiyonel):
   - **Key:** `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
   - **Value:** GraphQL endpoint URL'i (şimdilik boş bırakabilirsin)
   - **Environment:** Production, Preview, Development
3. Save

---

## 🚀 Medusa Backend Deploy Edildikten Sonra

Medusa backend'i Railway'e deploy ettikten sonra:

1. Railway'den backend URL'ini al (örn: `https://belucha-medusa.railway.app`)
2. Vercel → Shop App → Environment Variables
3. `NEXT_PUBLIC_MEDUSA_BACKEND_URL` değerini güncelle:
   - Eski: `http://localhost:9000`
   - Yeni: `https://belucha-medusa.railway.app`
4. Redeploy et (otomatik olabilir)

---

## ✅ Kontrol Listesi

- [ ] `apps/shop/.env.local` dosyası oluşturuldu
- [ ] `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000` eklendi
- [ ] Vercel Shop App projesine `NEXT_PUBLIC_MEDUSA_BACKEND_URL` eklendi
- [ ] Vercel Sellercentral projesine (opsiyonel) `NEXT_PUBLIC_GRAPHQL_ENDPOINT` eklendi
- [ ] Medusa backend deploy edildikten sonra Vercel'deki URL güncellenecek

---

## 📝 Notlar

- `.env.local` dosyaları Git'e commit edilmez (`.gitignore`'da)
- `NEXT_PUBLIC_*` prefix'i olan değişkenler client-side'da kullanılabilir
- Environment variables değiştikten sonra Vercel otomatik redeploy eder
- Local'de değişiklik yaptıktan sonra `npm run dev`'i yeniden başlat
