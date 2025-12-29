# Environment Variables Checklist

## ✅ Kontrol Listesi

### 1. Railway (Payload CMS) - KONTROL ET

Railway Dashboard → Service → Variables bölümünde şunlar olmalı:

```
✅ DATABASE_URI
   Değer: mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?appName=Belucha

✅ NODE_ENV
   Değer: production

✅ PAYLOAD_MONGO_URL
   Değer: mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority

✅ PAYLOAD_PUBLIC_SERVER_URL
   Değer: https://beluchacms-production.up.railway.app
   ⚠️ ÖNEMLİ: Bu değer mutlaka beluchacms-production.up.railway.app olmalı!

✅ PAYLOAD_SECRET
   Değer: beluchaSecret123456789012345678901234567890

✅ PORT
   Değer: 3001
```

**⚠️ DİKKAT:** `PAYLOAD_PUBLIC_SERVER_URL` değeri `https://beluchacms-production.up.railway.app` olmalı. Eğer `https://belucha-cms.railway.app` görüyorsan, değiştir!

---

### 2. Vercel - Sellercentral - KONTROL ET

Vercel Dashboard → Project (belucha-sellercentral) → Settings → Environment Variables

```
✅ NEXT_PUBLIC_PAYLOAD_ADMIN_URL
   Değer: https://beluchacms-production.up.railway.app/admin
   Environment: Production (veya All Environments)

✅ NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL
   Değer: https://beluchacms-production.up.railway.app/api/graphql
   Environment: Production (veya All Environments)

✅ NEXT_PUBLIC_SHOP_URL
   Değer: https://belucha-shop.vercel.app
   Environment: Production (veya All Environments)
```

---

### 3. Vercel - Shop - KONTROL ET

Vercel Dashboard → Project (belucha-shop) → Settings → Environment Variables

```
✅ NEXT_PUBLIC_PAYLOAD_ADMIN_URL
   Değer: https://beluchacms-production.up.railway.app/admin
   Environment: All Environments

✅ NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL
   Değer: https://beluchacms-production.up.railway.app/api/graphql
   Environment: All Environments

✅ NEXT_PUBLIC_SELLERCENTRAL_URL
   Değer: https://belucha-sellercentral.vercel.app
   Environment: All Environments
```

---

## 🔧 Yapman Gerekenler

### Adım 1: Railway'de PAYLOAD_PUBLIC_SERVER_URL Kontrolü

1. Railway Dashboard'a git: https://railway.app
2. Projeni seç → Service'i seç
3. **Variables** sekmesine git
4. `PAYLOAD_PUBLIC_SERVER_URL` değişkenini bul
5. Değeri kontrol et:
   - ❌ Yanlış: `https://belucha-cms.railway.app`
   - ✅ Doğru: `https://beluchacms-production.up.railway.app`
6. Eğer yanlışsa:
   - Değişkeni düzenle
   - Değeri `https://beluchacms-production.up.railway.app` yap
   - Kaydet
   - Railway otomatik olarak yeniden deploy edecek

### Adım 2: Vercel'de Environment Variables Kontrolü

#### Sellercentral için:
1. Vercel Dashboard → belucha-sellercentral projesi
2. Settings → Environment Variables
3. Şu değişkenleri kontrol et:
   - `NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL` = `https://beluchacms-production.up.railway.app/api/graphql`
   - `NEXT_PUBLIC_PAYLOAD_ADMIN_URL` = `https://beluchacms-production.up.railway.app/admin`
   - `NEXT_PUBLIC_SHOP_URL` = `https://belucha-shop.vercel.app`

#### Shop için:
1. Vercel Dashboard → belucha-shop projesi
2. Settings → Environment Variables
3. Şu değişkenleri kontrol et:
   - `NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL` = `https://beluchacms-production.up.railway.app/api/graphql`
   - `NEXT_PUBLIC_PAYLOAD_ADMIN_URL` = `https://beluchacms-production.up.railway.app/admin`
   - `NEXT_PUBLIC_SELLERCENTRAL_URL` = `https://belucha-sellercentral.vercel.app`

### Adım 3: Değişikliklerden Sonra

1. **Railway'de değişiklik yaptıysan:**
   - Railway otomatik deploy edecek
   - Deploy loglarını kontrol et
   - 2-3 dakika bekle

2. **Vercel'de değişiklik yaptıysan:**
   - Vercel otomatik deploy edecek
   - Veya manuel olarak "Redeploy" yapabilirsin

### Adım 4: Test Et

1. **Sellercentral:** https://belucha-sellercentral.vercel.app/
   - Dashboard açılmalı
   - Kategoriler görünmeli
   - GraphQL istekleri çalışmalı

2. **Shop:** https://belucha-shop.vercel.app/
   - Ana sayfa açılmalı
   - Ürünler görünmeli

3. **Payload CMS:** https://beluchacms-production.up.railway.app/admin
   - Admin panel açılmalı
   - GraphQL: https://beluchacms-production.up.railway.app/api/graphql

---

## 🐛 Sorun Giderme

### Eğer hala CORS hatası alıyorsan:

1. Railway'de `PAYLOAD_PUBLIC_SERVER_URL` değerini kontrol et
2. Railway'de yeniden deploy et
3. Browser cache'ini temizle (Ctrl+Shift+Delete)
4. Hard refresh yap (Ctrl+F5)

### Eğer kategoriler görünmüyorsa:

1. Browser Console'u aç (F12)
2. Network tab'ına git
3. GraphQL isteklerini kontrol et
4. Hata mesajlarını kontrol et

### Eğer 404 hatası alıyorsan:

1. Railway'de service'in çalıştığından emin ol
2. Railway logs'u kontrol et
3. `PAYLOAD_PUBLIC_SERVER_URL` değerini kontrol et

---

## 📋 Hızlı Kontrol Listesi

- [ ] Railway: `PAYLOAD_PUBLIC_SERVER_URL` = `https://beluchacms-production.up.railway.app`
- [ ] Vercel Sellercentral: `NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL` = `https://beluchacms-production.up.railway.app/api/graphql`
- [ ] Vercel Shop: `NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL` = `https://beluchacms-production.up.railway.app/api/graphql`
- [ ] Tüm değişikliklerden sonra deploy'lar tamamlandı
- [ ] Test edildi ve çalışıyor

---

## 💡 Notlar

- Railway bazen varsayılan URL gösterir ama senin girdiğin değer kullanılır
- Deploy loglarını kontrol etmek önemli
- Environment variable değişiklikleri genelde 1-2 dakika içinde aktif olur
- Production'da test et, local'de değil

