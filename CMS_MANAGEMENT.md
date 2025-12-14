# 🎛️ Payload CMS Yönetim Rehberi

**Bu dosya Payload CMS'in nasıl yönetileceğini ve kullanılacağını açıklar.**

---

## 📋 İçindekiler

1. [Payload CMS Nedir?](#payload-cms-nedir)
2. [CMS'e Nasıl Erişilir?](#cmse-nasıl-erişilir)
3. [Admin Panel Kullanımı](#admin-panel-kullanımı)
4. [Collections (Veri Koleksiyonları)](#collections-veri-koleksiyonları)
5. [GraphQL API Kullanımı](#graphql-api-kullanımı)
6. [Ne İşe Yarar?](#ne-işe-yarar)
7. [Neler Yapılabilir?](#neler-yapılabilir)

---

## 🎯 Payload CMS Nedir?

**Payload CMS**, Node.js tabanlı bir **headless CMS** (içerik yönetim sistemi) dir.

**Özellikler:**
- ✅ **GraphQL API** sağlar
- ✅ **REST API** sağlar
- ✅ **Admin Panel** sağlar (görsel yönetim)
- ✅ **MongoDB** ile çalışır
- ✅ **TypeScript** desteği
- ✅ **Authentication** (kimlik doğrulama) sistemi
- ✅ **File Upload** (dosya yükleme) desteği

**Sistemdeki Rolü:**
- Tüm verilerin (ürünler, satıcılar, müşteriler, siparişler) merkezi yönetimi
- Shop ve Sellercentral uygulamalarının veri kaynağı
- Admin panel ile görsel yönetim

---

## 🔗 CMS'e Nasıl Erişilir?

### Local Development

```bash
cd apps/cms/payload
npm run dev
```

**URL'ler:**
- Admin Panel: `http://localhost:3001/admin`
- GraphQL API: `http://localhost:3001/api/graphql`
- REST API: `http://localhost:3001/api/*`

### Production (Railway/Render Deploy Edildikten Sonra)

**URL'ler:**
- Admin Panel: `https://belucha-cms.railway.app/admin`
- GraphQL API: `https://belucha-cms.railway.app/api/graphql`
- REST API: `https://belucha-cms.railway.app/api/*`

---

## 🖥️ Admin Panel Kullanımı

### İlk Giriş

1. CMS'e ilk kez giriş yaparken **admin kullanıcısı** oluşturmanız gerekir
2. Admin panel: `/admin` URL'ine gidin
3. Formu doldurun:
   - Email
   - Password
   - Confirm Password
4. **Create First User** tıklayın

### Admin Panel Özellikleri

**Sol Menü:**
- **Collections** - Veri koleksiyonları
  - Products (Ürünler)
  - Categories (Kategoriler)
  - Brands (Markalar)
  - Sellers (Satıcılar)
  - Customers (Müşteriler)
  - Orders (Siparişler)
  - Media (Dosyalar - görseller, vb.)
- **Globals** - Global ayarlar
- **Users** - Kullanıcılar (admin kullanıcıları)

**Her Collection için:**
- ✅ **List View** - Tüm kayıtları görüntüle
- ✅ **Create** - Yeni kayıt oluştur
- ✅ **Edit** - Mevcut kayıtı düzenle
- ✅ **Delete** - Kayıt sil (bazı collection'larda kapalı)
- ✅ **Filter** - Kayıtları filtrele
- ✅ **Search** - Kayıtları ara

---

## 📦 Collections (Veri Koleksiyonları)

### 1. Products (Ürünler)

**Ne İçerir:**
- Ürün adı, açıklama, fiyat
- Kategori, marka, satıcı
- Görseller
- Stok durumu
- Durum (draft, published, archived)

**Kullanım:**
- Shop'ta görüntülenen ürünler
- Sellercentral'de satıcılar tarafından eklenen ürünler

**Örnek Kullanım:**
```
Admin Panel → Products → Create
- Title: "iPhone 15 Pro"
- Price: 1299.99
- Category: "Electronics"
- Seller: "TechStore"
- Status: "Published"
```

### 2. Sellers (Satıcılar)

**Ne İçerir:**
- Mağaza adı, açıklama
- Slug (URL-friendly isim)
- Logo, banner görselleri
- Stripe hesap ID (ödeme için)
- Komisyon oranı
- Durum (pending, active, suspended)

**Kullanım:**
- Sellercentral'de kayıt olan satıcılar
- Shop'ta ürünlerin yanında gösterilen satıcı bilgileri

**Örnek Kullanım:**
```
Admin Panel → Sellers → Create
- Store Name: "TechStore"
- Slug: "techstore"
- Status: "Active"
```

### 3. Customers (Müşteriler)

**Ne İçerir:**
- Email, ad, soyad
- Cinsiyet, doğum tarihi
- Telefon, adres bilgileri
- User ID (authentication için)

**Kullanım:**
- Shop'ta kayıt olan müşteriler
- Siparişlerde müşteri bilgileri

**Örnek Kullanım:**
```
Admin Panel → Customers → Create
- Email: "customer@example.com"
- First Name: "John"
- Last Name: "Doe"
- Address: "123 Main St"
- City: "Berlin"
- Country: "Germany"
```

### 4. Orders (Siparişler)

**Ne İçerir:**
- Sipariş numarası
- Müşteri bilgileri
- Ürünler ve miktarları
- Toplam tutar
- Ödeme durumu
- Teslimat adresi

**Kullanım:**
- Shop'ta oluşturulan siparişler
- Sellercentral'de satıcıların siparişlerini görüntülemesi

### 5. Categories (Kategoriler)

**Ne İçerir:**
- Kategori adı, açıklama
- Slug
- Görsel

**Kullanım:**
- Shop'ta ürün filtreleme
- Ürünlerin kategorilere göre gruplanması

### 6. Brands (Markalar)

**Ne İçerir:**
- Marka adı, açıklama
- Slug
- Logo

**Kullanım:**
- Ürünlerin marka bilgileri
- Shop'ta marka filtreleme

### 7. Media (Dosyalar)

**Ne İçerir:**
- Yüklenen görseller, dosyalar
- Dosya adı, boyutu, tipi
- Alt text, açıklama

**Kullanım:**
- Ürün görselleri
- Satıcı logoları, banner'ları
- Kategori görselleri

---

## 🔌 GraphQL API Kullanımı

### GraphQL Playground

**URL:** `http://localhost:3001/api/graphql` (veya production URL'i)

**Kullanım:**
1. GraphQL Playground'a gidin
2. Sol panelde query yazın
3. **Play** butonuna tıklayın
4. Sağ panelde sonuçları görün

### Örnek Queries

**Ürünleri Listele:**
```graphql
query GetProducts {
  Products {
    docs {
      id
      title
      price
      slug
      seller {
        storeName
      }
    }
  }
}
```

**Tek Ürün Getir:**
```graphql
query GetProduct($slug: String!) {
  Products(where: { slug: { equals: $slug } }) {
    docs {
      id
      title
      price
      description
      images {
        url
      }
    }
  }
}
```

**Satıcıları Listele:**
```graphql
query GetSellers {
  Sellers {
    docs {
      id
      storeName
      slug
      status
    }
  }
}
```

### Örnek Mutations

**Yeni Ürün Oluştur:**
```graphql
mutation CreateProduct($data: JSON!) {
  createProducts(data: $data) {
    id
    title
    price
  }
}
```

**Variables:**
```json
{
  "data": {
    "title": "iPhone 15 Pro",
    "price": 1299.99,
    "slug": "iphone-15-pro",
    "category": "electronics",
    "status": "published"
  }
}
```

**Satıcı Oluştur:**
```graphql
mutation CreateSeller($data: JSON!) {
  createSellers(data: $data) {
    id
    storeName
    slug
  }
}
```

---

## 💡 Ne İşe Yarar?

### 1. Merkezi Veri Yönetimi

- Tüm veriler tek bir yerde (MongoDB)
- Admin panel ile görsel yönetim
- Veri tutarlılığı

### 2. API Sağlama

- Shop ve Sellercentral uygulamaları GraphQL API kullanır
- REST API alternatifi
- Otomatik API dokümantasyonu

### 3. Authentication

- Satıcılar için authentication (Sellers collection)
- Admin kullanıcıları için authentication
- JWT token tabanlı güvenlik

### 4. File Management

- Görsel yükleme ve yönetimi
- CDN entegrasyonu (opsiyonel)
- Dosya organizasyonu

### 5. Content Management

- Ürün içerikleri
- Kategori ve marka yönetimi
- SEO-friendly URL'ler (slug)

---

## 🚀 Neler Yapılabilir?

### Admin Panel Üzerinden

1. **Ürün Yönetimi**
   - ✅ Yeni ürün ekle
   - ✅ Ürün düzenle
   - ✅ Ürün sil
   - ✅ Ürün durumunu değiştir (draft → published)
   - ✅ Ürün görselleri yükle

2. **Satıcı Yönetimi**
   - ✅ Yeni satıcı ekle
   - ✅ Satıcı durumunu değiştir (pending → active)
   - ✅ Satıcı bilgilerini düzenle
   - ✅ Satıcı logoları yükle

3. **Müşteri Yönetimi**
   - ✅ Müşteri bilgilerini görüntüle
   - ✅ Müşteri adreslerini düzenle
   - ✅ Müşteri sipariş geçmişi

4. **Sipariş Yönetimi**
   - ✅ Siparişleri görüntüle
   - ✅ Sipariş durumunu güncelle
   - ✅ Sipariş detaylarını incele

5. **Kategori ve Marka Yönetimi**
   - ✅ Yeni kategori/marka ekle
   - ✅ Kategori/marka düzenle
   - ✅ Hiyerarşik kategori yapısı

### GraphQL API Üzerinden

1. **Shop App**
   - ✅ Ürünleri listele
   - ✅ Ürün detaylarını getir
   - ✅ Kategorilere göre filtrele
   - ✅ Satıcılara göre filtrele
   - ✅ Arama yap

2. **Sellercentral App**
   - ✅ Satıcı ürünlerini listele
   - ✅ Yeni ürün ekle
   - ✅ Ürün düzenle
   - ✅ Siparişleri görüntüle

3. **Programmatic Access**
   - ✅ Script'ler ile veri yönetimi
   - ✅ Bulk import/export
   - ✅ Veri senkronizasyonu

---

## 🔐 Authentication

### Satıcı Authentication

**Sellers collection** `auth: true` olarak ayarlı:
- Satıcılar email/password ile giriş yapabilir
- JWT token alırlar
- Token ile API istekleri yapabilirler

**Kullanım:**
```graphql
mutation LoginSeller($email: String!, $password: String!) {
  loginSellers(email: $email, password: $password) {
    token
    user {
      id
      storeName
    }
  }
}
```

### Admin Authentication

- Admin panel için ayrı kullanıcı sistemi
- Admin kullanıcıları `/admin` panelinde yönetilir
- Yüksek yetkili işlemler için kullanılır

---

## 📊 Veri İlişkileri

**Products → Seller:**
- Her ürün bir satıcıya ait
- `seller` field'ı ile bağlanır

**Products → Category:**
- Her ürün bir kategoriye ait
- `category` field'ı ile bağlanır

**Products → Brand:**
- Her ürün bir markaya ait (opsiyonel)
- `brand` field'ı ile bağlanır

**Orders → Customer:**
- Her sipariş bir müşteriye ait
- `customer` field'ı ile bağlanır

**Orders → Products:**
- Siparişler birden fazla ürün içerebilir
- `items` array field'ı ile bağlanır

---

## 🎯 Özet

**Payload CMS:**
- ✅ Tüm verilerin merkezi yönetimi
- ✅ Admin panel ile görsel yönetim
- ✅ GraphQL API ile programmatic erişim
- ✅ Authentication sistemi
- ✅ File upload desteği
- ✅ MongoDB ile veri saklama

**Shop ve Sellercentral:**
- ✅ GraphQL API kullanarak veri çeker
- ✅ Mutation'lar ile veri oluşturur/günceller
- ✅ Authentication token'ları kullanır

---

**Son Güncelleme:** 2024  
**Durum:** CMS local development'ta çalışıyor. Production deploy edilmeli.

