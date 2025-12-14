# 🗄️ MongoDB Atlas Kurulum Rehberi

**Bu dosya MongoDB Atlas kurulumu ve Payload CMS bağlantısı için adım adım rehberdir.**

---

## 📋 İçindekiler

1. [MongoDB Atlas Hesabı Oluşturma](#mongodb-atlas-hesabı-oluşturma)
2. [Cluster Oluşturma](#cluster-oluşturma)
3. [Database User Oluşturma](#database-user-oluşturma)
4. [Network Access Ayarları](#network-access-ayarları)
5. [Connection String Alma](#connection-string-alma)
6. [Payload CMS'e Bağlama](#payload-cmse-bağlama)
7. [Test Etme](#test-etme)

---

## 🚀 MongoDB Atlas Hesabı Oluşturma

### Adım 1: Hesap Oluştur

1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → **Try Free** veya **Sign Up**
2. Google, GitHub veya Email ile kayıt olun
3. Email doğrulaması yapın

### Adım 2: Organization ve Project Oluştur

1. **Create an Organization** (veya mevcut birini seçin)
   - Organization Name: `Belucha` (veya istediğiniz isim)
2. **Create a Project**
   - Project Name: `Belucha Project`
   - **Next** tıklayın

---

## 🎯 Cluster Oluşturma

### Adım 1: Cluster Seçimi

1. **Build a Database** tıklayın
2. **Shared** (Free tier) seçin
3. **Create** tıklayın

### Adım 2: Cloud Provider ve Region

1. **Cloud Provider:** AWS (veya istediğiniz)
2. **Region:** En yakın region'ı seçin (örn: `Frankfurt (eu-central-1)`)
3. **Cluster Tier:** `M0 FREE` (ücretsiz tier)
4. **Cluster Name:** `belucha` (oluşturuldu)
5. **Create Cluster** tıklayın

**Gerçek Bilgiler:**
- **Cluster Name:** `belucha`
- **Cluster URL:** `belucha.dijx1dj.mongodb.net`

**Not:** Cluster oluşturma 3-5 dakika sürebilir.

---

## 👤 Database User Oluşturma

### Adım 1: Database Access

1. Sol menüden **Database Access** tıklayın
2. **Add New Database User** tıklayın

### Adım 2: User Bilgileri

1. **Authentication Method:** `Password`
2. **Username:** `belucha` (oluşturuldu)
3. **Password:** `fDnQg90ThKO50DA8` (kaydedildi)
4. **Database User Privileges:** `Read and write to any database`
5. **Add User** tıklayın

**⚠️ ÖNEMLİ:** Username ve password'ü kaydedin! Connection string'de kullanılacak.

**Gerçek Bilgiler:**
- Username: `belucha`
- Password: `fDnQg90ThKO50DA8`

---

## 🌐 Network Access Ayarları

### Adım 1: Network Access

1. Sol menüden **Network Access** tıklayın
2. **Add IP Address** tıklayın

### Adım 2: IP Whitelist

**Seçenek 1: Tüm IP'lere İzin Ver (Development için)**
1. **Allow Access from Anywhere** tıklayın
2. IP Address: `0.0.0.0/0` otomatik eklenir
3. **Confirm** tıklayın

**Seçenek 2: Sadece Belirli IP'lere İzin Ver (Production için)**
1. **Add Current IP Address** tıklayın (şu anki IP'niz eklenir)
2. Veya manuel IP ekleyin
3. **Confirm** tıklayın

**Not:** Development için `0.0.0.0/0` kullanabilirsiniz, production'da sadece gerekli IP'leri ekleyin.

---

## 🔗 Connection String Alma

### Adım 1: Connect

1. Sol menüden **Database** tıklayın
2. Cluster'ınızın yanında **Connect** butonuna tıklayın

### Adım 2: Connection Method

1. **Connect your application** seçeneğini seçin
2. **Driver:** `Node.js`
3. **Version:** `5.5 or later`

### Adım 3: Connection String Kopyalama

**MongoDB Atlas'tan aldığınız connection string:**
```
mongodb+srv://belucha:<db_password>@belucha.dijx1dj.mongodb.net/?appName=Belucha
```

**⚠️ ÖNEMLİ:**
- `<db_password>` kısmını gerçek password ile değiştirin
- Database adını (`/belucha`) ekleyin
- Standart parametreleri (`?retryWrites=true&w=majority`) kullanın

**Düzeltilmiş connection string (gerçek verilerle):**
```
mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
```

**Değişiklikler:**
- `<db_password>` → `fDnQg90ThKO50DA8` (gerçek password)
- `/?appName=Belucha` → `/belucha?retryWrites=true&w=majority` (database adı + standart parametreler)

---

## 🔌 Payload CMS'e Bağlama

### Adım 1: Local Development (.env.local)

**Dosya:** `apps/cms/payload/.env.local`

**Gerçek verilerle doldurulmuş format:**
```env
PAYLOAD_SECRET=beluchaSecret123456789012345678901234567890
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
PORT=3001
PAYLOAD_MONGO_URL=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
DATABASE_URI=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
```

**Gerçek Bilgiler:**
- **Username:** `belucha`
- **Password:** `fDnQg90ThKO50DA8` (özel karakter yok, URL encode gerekmez)
- **Cluster:** `belucha.dijx1dj.mongodb.net`
- **Database:** `belucha`
- **PAYLOAD_SECRET:** `beluchaSecret123456789012345678901234567890` (32+ karakter)

**Not:** 
- Password'de özel karakter olmadığı için URL encode gerekmez
- Database adı (`/belucha`) connection string'e eklendi
- Standart parametreler (`?retryWrites=true&w=majority`) kullanıldı

### Adım 2: Test Etme

```bash
cd apps/cms/payload
npm run dev
```

**Başarılı bağlantı logları:**
```
✅ Connected to MongoDB
✅ Payload Admin URL: http://localhost:3001/admin
✅ GraphQL API: http://localhost:3001/api/graphql
```

**Hata varsa:**
- Connection string'i kontrol edin
- Password'ü URL encode edin
- Network Access ayarlarını kontrol edin
- Database user'ın doğru olduğundan emin olun

---

## 🧪 Test Etme

### Adım 1: CMS Başlatma

```bash
cd apps/cms/payload
npm run dev
```

### Adım 2: Admin Panel'e Giriş

1. `http://localhost:3001/admin` açın
2. İlk kullanıcı oluşturma formu görünmeli
3. Admin kullanıcısı oluşturun

### Adım 3: Veri Kontrolü

1. Admin panel'de **Collections** görünmeli
2. **Products**, **Sellers**, **Customers** vb. collection'lar görünmeli
3. Yeni bir kayıt oluşturmayı deneyin

---

## 🚀 Production (Railway/Render)

### Railway/Render Environment Variables

**Railway/Render Dashboard → Variables → Add:**

```
PAYLOAD_SECRET=beluchaSecret123456789012345678901234567890
PAYLOAD_PUBLIC_SERVER_URL=https://belucha-cms.railway.app
PAYLOAD_MONGO_URL=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
PORT=3001
NODE_ENV=production
```

**Not:** Production'da `PAYLOAD_MONGO_URL` aynı connection string'i kullanır (local ile aynı).

---

## ✅ Checklist

- [ ] MongoDB Atlas hesabı oluşturuldu
- [ ] Cluster oluşturuldu (M0 FREE)
- [ ] Database user oluşturuldu (username + password kaydedildi)
- [ ] Network Access ayarlandı (0.0.0.0/0 veya belirli IP'ler)
- [ ] Connection string alındı ve kaydedildi
- [ ] `.env.local` dosyası oluşturuldu
- [ ] `PAYLOAD_MONGO_URL` ayarlandı (password URL encoded)
- [ ] CMS başlatıldı ve bağlantı test edildi
- [ ] Admin panel'e erişildi
- [ ] Test kaydı oluşturuldu

---

## 🐛 Sorun Giderme

### "Authentication failed"

**Çözüm:**
- Database user password'ünü kontrol edin
- Password'ü URL encode edin
- Connection string'deki username'i kontrol edin

### "Connection timeout"

**Çözüm:**
- Network Access ayarlarını kontrol edin
- IP adresinizin whitelist'te olduğundan emin olun
- `0.0.0.0/0` ekleyin (development için)

### "Database not found"

**Çözüm:**
- Connection string'de database adını kontrol edin (`/belucha`)
- Database adını connection string'e ekleyin

### "Invalid connection string"

**Çözüm:**
- Connection string formatını kontrol edin
- Özel karakterleri URL encode edin
- `<password>` placeholder'ını gerçek password ile değiştirin

---

**Son Güncelleme:** 2024  
**Durum:** MongoDB Atlas kurulum rehberi hazır.

