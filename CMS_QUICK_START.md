# 🚀 CMS Hızlı Başlangıç

## ✅ CMS Başarıyla Başladı!

CMS şu anda çalışıyor:
- **Admin Panel:** http://localhost:3001/admin
- **GraphQL API:** http://localhost:3001/api/graphql
- **Port:** 3001

---

## 📝 Terminal Komutları

### Doğru Kullanım

**Eğer root dizindeyken:**
```bash
cd apps/cms/payload
npm run dev
```

**Eğer zaten `apps/cms/payload` dizinindeyken:**
```bash
# cd komutuna gerek yok, direkt:
npm run dev
```

### Hata Mesajı Açıklaması

Eğer şu hatayı görüyorsanız:
```
cd : Cannot find path '...\apps\cms\payload\apps\cms\payload' because it does not exist.
```

**Neden?**
- Zaten `apps/cms/payload` dizinindesiniz
- Tekrar `cd apps/cms/payload` yapmaya çalışıyorsunuz
- Bu bir hata değil, sadece gereksiz bir komut

**Çözüm:**
- `cd` komutunu atlayın, direkt `npm run dev` çalıştırın
- Veya root dizine dönün: `cd ../../..` sonra `cd apps/cms/payload`

---

## 🎯 İlk Adımlar

### 1. Admin Kullanıcısı Oluştur

1. Tarayıcıda açın: `http://localhost:3001/admin`
2. İlk kullanıcı formunu doldurun:
   - Email
   - Password
   - Confirm Password
3. **Create First User** tıklayın

### 2. Test Hesapları Oluştur

**Satıcı Hesabı (Sellercentral için):**
- Admin Panel → **Sellers** → **Create New**
- Email: `seller@test.com`
- Password: Güçlü bir şifre
- Store Name: `Test Store`
- Slug: `test-store`
- Status: `Active`

**Müşteri Hesabı (Shop için):**
- Admin Panel → **Customers** → **Create New**
- Email: `customer@test.com`
- Password: Güçlü bir şifre
- First Name: `John`
- Last Name: `Doe`
- Gerekli bilgileri doldurun

---

## 🔍 MongoDB Bağlantısı Kontrolü

CMS başarıyla başladıysa MongoDB bağlantısı çalışıyor demektir.

**Test etmek için:**
1. Admin Panel'de bir collection açın (örn: Products)
2. Yeni bir kayıt oluşturmayı deneyin
3. Başarılı olursa MongoDB bağlantısı çalışıyor ✅

---

## 🛑 CMS'i Durdurma

Terminal'de `Ctrl + C` tuşlarına basın.

---

## 📚 İlgili Dosyalar

- `CMS_MANAGEMENT.md` - CMS yönetim rehberi
- `MONGODB_SETUP.md` - MongoDB kurulum rehberi
- `SETUP_GUIDE.md` - Kurulum rehberi

---

**Son Güncelleme:** 2024

