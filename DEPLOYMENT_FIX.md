# Deployment Fix Guide

## Sorunlar ve Çözümler

### 1. Railway URL Uyumsuzluğu

**Sorun:** Railway'de iki farklı URL var:
- `PAYLOAD_PUBLIC_SERVER_URL` = `https://belucha-cms.railway.app`
- Vercel'de kullanılan = `https://beluchacms-production.up.railway.app`

**Çözüm:** Railway'de `PAYLOAD_PUBLIC_SERVER_URL` değerini güncelle:

```
PAYLOAD_PUBLIC_SERVER_URL=https://beluchacms-production.up.railway.app
```

### 2. CORS Hatası

**Sorun:** Production'da CORS hatası alınıyor.

**Çözüm:** 
- ✅ CORS middleware server.js'e eklendi
- ✅ CORS listesi payload.config.js'de güncellendi
- Railway'de yeniden deploy et

### 3. Local Payload CMS Çalışmıyor

**Sorun:** `http://localhost:3001/api/graphql` 404 hatası veriyor.

**Çözüm:** Payload CMS server'ını başlat:

```bash
cd apps/cms/payload
npm run dev
```

Server başladıktan sonra:
- Admin Panel: http://localhost:3001/admin
- GraphQL API: http://localhost:3001/api/graphql

## Railway Environment Variables (Güncellenmiş)

```
DATABASE_URI=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?appName=Belucha
NODE_ENV=production
PAYLOAD_MONGO_URL=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
PAYLOAD_PUBLIC_SERVER_URL=https://beluchacms-production.up.railway.app
PAYLOAD_SECRET=beluchaSecret123456789012345678901234567890
PORT=3001
```

**ÖNEMLİ:** `PAYLOAD_PUBLIC_SERVER_URL` değerini `https://beluchacms-production.up.railway.app` olarak güncelle!

## Vercel Environment Variables (Doğru)

### Sellercentral:
```
NEXT_PUBLIC_PAYLOAD_ADMIN_URL=https://beluchacms-production.up.railway.app/admin
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://beluchacms-production.up.railway.app/api/graphql
NEXT_PUBLIC_SHOP_URL=https://belucha-shop.vercel.app/
```

### Shop:
```
NEXT_PUBLIC_PAYLOAD_ADMIN_URL=https://beluchacms-production.up.railway.app/admin
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://beluchacms-production.up.railway.app/api/graphql
NEXT_PUBLIC_SELLERCENTRAL_URL=https://belucha-sellercentral.vercel.app
```

## Adımlar

1. **Railway'de `PAYLOAD_PUBLIC_SERVER_URL` güncelle:**
   - Railway dashboard'a git
   - Service → Variables
   - `PAYLOAD_PUBLIC_SERVER_URL` değerini `https://beluchacms-production.up.railway.app` yap
   - Deploy et

2. **Local'de Payload CMS başlat:**
   ```bash
   cd apps/cms/payload
   npm run dev
   ```

3. **Test et:**
   - Local: http://localhost:3001/api/graphql
   - Production: https://beluchacms-production.up.railway.app/api/graphql

4. **Browser Console'da kontrol et:**
   - Network tab → GraphQL isteklerini kontrol et
   - Response'ları kontrol et

## GraphQL İsteğini Test Etme

Browser Console'da:

```javascript
fetch('https://beluchacms-production.up.railway.app/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      query {
        Categories(limit: 10) {
          docs {
            id
            name
          }
        }
      }
    `
  })
})
.then(res => res.json())
.then(data => console.log('Categories:', data))
.catch(err => console.error('Error:', err))
```

Başarılı olursa kategorileri göreceksin!

