# .env.local Dosyaları

Aşağıdaki dosyaları manuel olarak oluştur:

## 1. apps/cms/payload/.env.local

```env
# Payload CMS Environment Variables (Production)
PAYLOAD_SECRET=beluchaSecret123456789012345678901234567890
PAYLOAD_PUBLIC_SERVER_URL=https://beluchacms-production.up.railway.app
PORT=3001
DATABASE_URI=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?appName=Belucha
PAYLOAD_MONGO_URL=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
```

## 2. apps/sellercentral/.env.local

```env
# Sellercentral Environment Variables (Production)
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://beluchacms-production.up.railway.app/api/graphql
NEXT_PUBLIC_PAYLOAD_ADMIN_URL=https://beluchacms-production.up.railway.app/admin
NEXT_PUBLIC_SHOP_URL=https://belucha-shop.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## 3. apps/shop/.env.local

```env
# Shop Environment Variables (Production)
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://beluchacms-production.up.railway.app/api/graphql
NEXT_PUBLIC_PAYLOAD_ADMIN_URL=https://beluchacms-production.up.railway.app/admin
NEXT_PUBLIC_SELLERCENTRAL_URL=https://belucha-sellercentral.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## PowerShell ile Oluşturma

PowerShell'de şu komutları çalıştır:

```powershell
# Payload CMS .env.local (Production)
@"
# Payload CMS Environment Variables (Production)
PAYLOAD_SECRET=beluchaSecret123456789012345678901234567890
PAYLOAD_PUBLIC_SERVER_URL=https://beluchacms-production.up.railway.app
PORT=3001
DATABASE_URI=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?appName=Belucha
PAYLOAD_MONGO_URL=mongodb+srv://belucha:belucha@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
"@ | Out-File -FilePath "apps/cms/payload/.env.local" -Encoding utf8 -Force

# Sellercentral .env.local (Production)
@"
# Sellercentral Environment Variables (Production)
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://beluchacms-production.up.railway.app/api/graphql
NEXT_PUBLIC_PAYLOAD_ADMIN_URL=https://beluchacms-production.up.railway.app/admin
NEXT_PUBLIC_SHOP_URL=https://belucha-shop.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
"@ | Out-File -FilePath "apps/sellercentral/.env.local" -Encoding utf8 -Force

# Shop .env.local (Production)
@"
# Shop Environment Variables (Production)
NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL=https://beluchacms-production.up.railway.app/api/graphql
NEXT_PUBLIC_PAYLOAD_ADMIN_URL=https://beluchacms-production.up.railway.app/admin
NEXT_PUBLIC_SELLERCENTRAL_URL=https://belucha-sellercentral.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
"@ | Out-File -FilePath "apps/shop/.env.local" -Encoding utf8 -Force
```

## Railway'de PAYLOAD_PUBLIC_SERVER_URL Güncelleme

Railway'de `PAYLOAD_PUBLIC_SERVER_URL` değerini manuel olarak değiştir:

1. Railway Dashboard → Service → Variables
2. `PAYLOAD_PUBLIC_SERVER_URL` değişkenini bul
3. Değeri şu şekilde güncelle: `https://beluchacms-production.up.railway.app`
4. Kaydet (Railway otomatik deploy edecek)

**Not:** Railway bazen varsayılan değer gösterir ama senin girdiğin değer kullanılır. Deploy loglarını kontrol et.

