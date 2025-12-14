# 🚀 Belucha Kurulum Rehberi - Hızlı Başlangıç

**Bu dosya tüm kurulum adımlarını özetler. Sırayla takip edin.**

---

## 📋 Kurulum Sırası

1. ✅ **CMS Yönetim Rehberi** - `CMS_MANAGEMENT.md` (Okundu)
2. 🔄 **MongoDB Atlas Kurulumu** - `MONGODB_SETUP.md` (Şimdi yapılacak)
3. ⏳ **Google OAuth Kurulumu** - `GOOGLE_OAUTH_SETUP.md` (Sonra)
4. ⏳ **Test Hesapları Oluşturma** (MongoDB'den sonra)

---

## 🎯 Şimdi Ne Yapmalıyım?

### 1. MongoDB Atlas Kurulumu (ÖNCE BUNU YAPIN)

**Dosya:** `MONGODB_SETUP.md` - Adım adım takip edin

**Özet:**
1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → Hesap oluştur
2. Free cluster oluştur (M0 FREE)
3. Database user oluştur (username + password kaydet!)
4. Network Access: `0.0.0.0/0` ekle (development için)
5. Connection string al ve kaydet
6. `apps/cms/payload/.env.local` dosyası oluştur:
   ```env
   PAYLOAD_SECRET=your-random-secret-key-min-32-chars
   PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
   PORT=3001
   PAYLOAD_MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/belucha?retryWrites=true&w=majority
   ```
7. CMS'i başlat ve test et:
   ```bash
   cd apps/cms/payload
   npm run dev
   ```
8. `http://localhost:3001/admin` → İlk admin kullanıcısı oluştur

**⚠️ ÖNEMLİ:** Password'deki özel karakterleri URL encode edin (örn: `!` → `%21`)

---

### 2. Test Hesapları Oluşturma (MongoDB'den sonra)

#### A. Satıcı Hesabı (Sellercentral için)

**Yöntem 1: Admin Panel'den**
1. `http://localhost:3001/admin` → **Sellers** → **Create New**
2. Formu doldurun:
   - **Email:** `seller@test.com`
   - **Password:** Güçlü bir şifre
   - **Store Name:** `Test Store`
   - **Slug:** `test-store`
   - **Status:** `Active`
3. **Save** tıklayın

**Yöntem 2: GraphQL Mutation**
```graphql
mutation CreateSeller {
  createSellers(data: {
    email: "seller@test.com"
    password: "TestPassword123!"
    storeName: "Test Store"
    slug: "test-store"
    status: "active"
  }) {
    id
    email
    storeName
  }
}
```

**Test:**
- `https://belucha-sellercentral.vercel.app/login` → `seller@test.com` ile giriş yap

#### B. Müşteri Hesabı (Shop için)

**Yöntem 1: Admin Panel'den**
1. `http://localhost:3001/admin` → **Customers** → **Create New**
2. Formu doldurun:
   - **Email:** `customer@test.com`
   - **Password:** Güçlü bir şifre
   - **First Name:** `John`
   - **Last Name:** `Doe`
   - **Phone:** `+49 123 456789`
   - **Address:** `Teststraße 123`
   - **City:** `Berlin`
   - **Zip Code:** `10115`
   - **Country:** `Germany`
3. **Save** tıklayın

**Yöntem 2: GraphQL Mutation**
```graphql
mutation CreateCustomer {
  createCustomers(data: {
    email: "customer@test.com"
    password: "TestPassword123!"
    firstName: "John"
    lastName: "Doe"
    phone: "+49 123 456789"
    address: "Teststraße 123"
    city: "Berlin"
    zipCode: "10115"
    country: "Germany"
  }) {
    id
    email
    firstName
  }
}
```

**Test:**
- `https://belucha-shop.vercel.app/login` → `customer@test.com` ile giriş yap

---

### 3. Google OAuth Kurulumu (Opsiyonel - Sonra)

**Dosya:** `GOOGLE_OAUTH_SETUP.md` - Adım adım takip edin

**Özet:**
1. Google Cloud Console'da proje oluştur
2. OAuth 2.0 Credentials oluştur
3. Payload CMS'e entegre et
4. Shop ve Sellercentral'de Google login butonları ekle

**Not:** Şimdilik email/password ile giriş yapabilirsiniz. Google OAuth'u sonra ekleyebilirsiniz.

---

## 🔗 Domain'ler

**Şu anki domain'ler:**
- Shop: `https://belucha-shop.vercel.app`
- Sellercentral: `https://belucha-sellercentral.vercel.app`
- CMS: Henüz deploy edilmedi (local: `http://localhost:3001`)

**Sonra domain bağlandığında:**
- Environment variables'ları güncelleyin
- Google OAuth redirect URI'lerini güncelleyin

---

## ✅ Checklist

### MongoDB Atlas
- [ ] MongoDB Atlas hesabı oluşturuldu
- [ ] Cluster oluşturuldu (M0 FREE)
- [ ] Database user oluşturuldu
- [ ] Network Access ayarlandı
- [ ] Connection string alındı
- [ ] `.env.local` dosyası oluşturuldu
- [ ] CMS başlatıldı ve bağlantı test edildi
- [ ] Admin panel'e erişildi

### Test Hesapları
- [ ] Satıcı hesabı oluşturuldu (`seller@test.com`)
- [ ] Müşteri hesabı oluşturuldu (`customer@test.com`)
- [ ] Sellercentral'de satıcı girişi test edildi
- [ ] Shop'ta müşteri girişi test edildi

### Google OAuth (Opsiyonel)
- [ ] Google Cloud Console'da proje oluşturuldu
- [ ] OAuth 2.0 Credentials oluşturuldu
- [ ] Payload CMS'e entegre edildi
- [ ] Shop ve Sellercentral'de Google login butonları eklendi
- [ ] Test edildi

---

## 📚 İlgili Dosyalar

- `CMS_MANAGEMENT.md` - CMS yönetim rehberi
- `MONGODB_SETUP.md` - MongoDB Atlas kurulumu
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth kurulumu
- `DEPLOYMENT.md` - Vercel deployment rehberi

---

## 🆘 Sorun mu Yaşıyorsunuz?

1. **MongoDB bağlantı hatası:**
   - Connection string'i kontrol edin
   - Password'ü URL encode edin
   - Network Access ayarlarını kontrol edin

2. **CMS başlamıyor:**
   - `.env.local` dosyasını kontrol edin
   - `PAYLOAD_SECRET` en az 32 karakter olmalı
   - Port 3001 kullanımda mı kontrol edin

3. **Login çalışmıyor:**
   - Test hesaplarının doğru oluşturulduğundan emin olun
   - GraphQL API'nin çalıştığını kontrol edin
   - Environment variables'ları kontrol edin

---

**Son Güncelleme:** 2024  
**Durum:** Kurulum rehberleri hazır. MongoDB Atlas kurulumu yapılmalı.

