# 🧹 Payload CMS Temizleme Planı

## ChatGPT Analizi - Doğru ✅

**"Payload + Medusa = Premature Optimization"**
**"Medusa + Next = Production Ready Commerce"**

## Mevcut Durum

### ✅ Hazır Olanlar:
- `apps/shop/src/hooks/useMedusa.js` - Medusa hook'ları
- `apps/shop/src/lib/medusa-client.js` - Medusa REST client
- `apps/shop/src/components/ProductGrid.jsx` - Medusa products kullanıyor
- `apps/shop/src/app/page.jsx` - Medusa hook kullanıyor

### ❌ Kaldırılacaklar:
- Apollo Client (GraphQL)
- Payload CMS config
- Payload collections
- Payload admin routes
- Payload dependencies

## Temizleme Adımları

### 1. Payload Dependencies Kaldır
```json
// apps/shop/package.json
// Kaldırılacak:
- "@apollo/client"
- "@payloadcms/db-mongodb"
- "@payloadcms/next"
- "@payloadcms/richtext-lexical"
- "@payloadcms/ui"
- "graphql"
- "mongodb"
- "payload"
```

### 2. Payload Config Kaldır
- `apps/shop/src/payload.config.ts` → SİL
- `apps/shop/src/payload/` klasörü → SİL
- `apps/shop/next.config.js` → `withPayload` kaldır

### 3. Apollo Client Kaldır
- `apps/shop/src/lib/apollo-client.js` → SİL
- `apps/shop/src/components/Providers.jsx` → ApolloProvider kaldır
- Tüm `useQuery`, `gql`, `ApolloProvider` kullanımları → Medusa REST'e çevir

### 4. Payload Admin Routes Kaldır
- `apps/shop/src/app/(payload)/admin/` → SİL
- `apps/shop/src/app/api/graphql/` → SİL

### 5. GraphQL → REST Migration
Tüm GraphQL query'leri Medusa REST API'ye çevir:

**Örnek:**
```javascript
// ÖNCE (GraphQL)
const { data } = useQuery(GET_PRODUCTS)

// SONRA (REST)
const { products } = useMedusaProducts()
```

## Dosya Listesi

### Silinecek Dosyalar:
1. `apps/shop/src/payload.config.ts`
2. `apps/shop/src/payload/` (tüm klasör)
3. `apps/shop/src/lib/apollo-client.js`
4. `apps/shop/src/app/(payload)/admin/` (tüm klasör)
5. `apps/shop/src/app/api/graphql/` (tüm klasör)

### Değiştirilecek Dosyalar:
1. `apps/shop/package.json` - Dependencies temizle
2. `apps/shop/next.config.js` - withPayload kaldır
3. `apps/shop/src/app/layout.jsx` - ApolloProvider kaldır
4. `apps/shop/src/components/Providers.jsx` - ApolloProvider kaldır
5. `apps/shop/src/components/Navbar.jsx` - GraphQL → Medusa REST
6. `apps/shop/src/app/register/page.jsx` - GraphQL → Medusa REST
7. `apps/shop/src/app/login/page.jsx` - GraphQL → Medusa REST
8. `apps/shop/src/app/account/page.jsx` - GraphQL → Medusa REST
9. `apps/shop/src/components/templates/CategoryTemplate.jsx` - GraphQL → Medusa REST
10. `apps/shop/src/components/templates/ProductTemplate.jsx` - GraphQL → Medusa REST

## Medusa Backend Kurulumu (Ayrı Repo)

```bash
# 1. Yeni repo oluştur
mkdir belucha-medusa-backend
cd belucha-medusa-backend

# 2. Medusa CLI ile kur
npx create-medusa-app@latest .

# Seçenekler:
# - Project name: belucha-medusa-backend
# - Database: PostgreSQL (Railway'de hazır)
# - Admin: Yes
# - Storefront: No (Next.js'te var)

# 3. Environment variables
# MEDUSA_BACKEND_URL=http://localhost:9000
# DATABASE_URL=postgresql://...
# REDIS_URL=redis://...
```

## Sonuç

**Önce:**
- Payload CMS (GraphQL)
- Apollo Client
- MongoDB
- Karmaşık mimari

**Sonra:**
- Sadece Medusa (REST)
- Basit fetch/axios
- PostgreSQL
- Temiz mimari

## ChatGPT'nin Haklı Olduğu Noktalar

1. ✅ **Payload gereksiz** - Medusa zaten admin panel veriyor
2. ✅ **GraphQL gereksiz** - REST daha basit
3. ✅ **MongoDB gereksiz** - PostgreSQL daha iyi (Medusa için)
4. ✅ **Complexity azalır** - Daha az bug, daha hızlı development
