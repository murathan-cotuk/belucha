# Railway URL Fix - PAYLOAD_PUBLIC_SERVER_URL Override

## Sorun

Railway otomatik olarak `PAYLOAD_PUBLIC_SERVER_URL` değişkenini oluşturuyor ve `https://belucha-cms.railway.app` olarak ayarlıyor. Bu değişkeni manuel olarak değiştiremiyorsun.

## Çözüm

Kod tarafında override ettik. Artık iki seçeneğin var:

### Seçenek 1: Railway'de Yeni Bir Değişken Ekle (Önerilen)

Railway Dashboard → Service → Variables → **Yeni Değişken Ekle:**

```
Değişken Adı: PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE
Değer: https://beluchacms-production.up.railway.app
```

Bu değişken varsa, kod bunu kullanacak ve Railway'in otomatik oluşturduğu değeri görmezden gelecek.

### Seçenek 2: Railway'in Gerçek URL'sini Kullan

Eğer `https://beluchacms-production.up.railway.app` Railway'in gerçek production URL'si ise, kod otomatik olarak bunu kullanacak.

## Railway Environment Variables (Güncellenmiş)

Şu değişkenleri ekle:

```
✅ PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE
   Değer: https://beluchacms-production.up.railway.app
   
✅ RAILWAY_ENVIRONMENT (opsiyonel)
   Değer: production
```

**Not:** `PAYLOAD_PUBLIC_SERVER_URL` değişkenini silme veya değiştirmeye çalışma. Railway otomatik oluşturuyor. Bunun yerine `PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE` ekle.

## Kod Değişikliği

`payload.config.js` dosyasında şu mantık var:

```javascript
serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE || 
           (process.env.RAILWAY_ENVIRONMENT === 'production' 
             ? 'https://beluchacms-production.up.railway.app' 
             : process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001')
```

Bu mantık şu sırayla çalışır:
1. Önce `PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE` kontrol eder (varsa bunu kullanır)
2. Eğer yoksa ve `RAILWAY_ENVIRONMENT=production` ise, production URL'yi kullanır
3. Eğer yoksa, Railway'in otomatik oluşturduğu `PAYLOAD_PUBLIC_SERVER_URL` kullanılır
4. Hiçbiri yoksa, localhost kullanılır

## Adımlar

1. **Railway Dashboard'a git**
2. **Service → Variables**
3. **"New Variable" butonuna tıkla**
4. **Değişken adı:** `PAYLOAD_PUBLIC_SERVER_URL_OVERRIDE`
5. **Değer:** `https://beluchacms-production.up.railway.app`
6. **Kaydet**
7. **Railway otomatik deploy edecek**

## Test

Deploy tamamlandıktan sonra:

1. Railway logs'u kontrol et:
   - `Payload Admin URL: https://beluchacms-production.up.railway.app/admin` görmeli
   - `GraphQL API: https://beluchacms-production.up.railway.app/api/graphql` görmeli

2. Browser'da test et:
   - https://beluchacms-production.up.railway.app/admin
   - https://beluchacms-production.up.railway.app/api/graphql

3. Vercel'de test et:
   - Sellercentral: https://belucha-sellercentral.vercel.app
   - Kategoriler görünmeli
   - GraphQL istekleri çalışmalı

## Alternatif: Railway'in Gerçek URL'sini Kullan

Eğer Railway'in gerçek production URL'si `https://belucha-cms.railway.app` ise, Vercel'deki environment variable'ları da buna göre güncelle:

**Vercel - Sellercentral:**
```
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://belucha-cms.railway.app/api/graphql
NEXT_PUBLIC_PAYLOAD_ADMIN_URL=https://belucha-cms.railway.app/admin
```

**Vercel - Shop:**
```
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://belucha-cms.railway.app/api/graphql
NEXT_PUBLIC_PAYLOAD_ADMIN_URL=https://belucha-cms.railway.app/admin
```

**Ama bu durumda CORS listesine de eklemek gerekir (zaten ekli).**

