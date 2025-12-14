# 📝 .env.local Dosyası Formatı

**Dosya:** `apps/cms/payload/.env.local`

## ✅ Doğru Format (1-7 Satırlar)

```env
PAYLOAD_SECRET=beluchaSecret123456789012345678901234567890
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
PORT=3001
PAYLOAD_MONGO_URL=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
DATABASE_URI=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
```

## 📋 Açıklamalar

### Satır 1: PAYLOAD_SECRET
```env
PAYLOAD_SECRET=beluchaSecret123456789012345678901234567890
```
- **Açıklama:** Payload CMS için güvenlik anahtarı
- **Gereksinim:** Minimum 32 karakter
- **Örnek:** Rastgele bir string oluşturun veya yukarıdaki gibi uzun bir string kullanın

### Satır 2: PAYLOAD_PUBLIC_SERVER_URL
```env
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
```
- **Açıklama:** CMS'in public URL'i
- **Local:** `http://localhost:3001`
- **Production:** `https://belucha-cms.railway.app` (deploy edildikten sonra)

### Satır 3: PORT
```env
PORT=3001
```
- **Açıklama:** CMS'in çalışacağı port
- **Varsayılan:** 3001

### Satır 4: PAYLOAD_MONGO_URL
```env
PAYLOAD_MONGO_URL=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
```
- **Açıklama:** MongoDB connection string
- **Format:** `mongodb+srv://username:password@cluster.mongodb.net/database?options`
- **Önemli:** 
  - Database adı eklenmeli: `/belucha`
  - Standart parametreler: `?retryWrites=true&w=majority`

### Satır 5-7: Alternatif MongoDB Variables
```env
DATABASE_URI=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
```
- **Açıklama:** Payload CMS bu alternatif isimleri de kabul eder
- **Not:** Aynı connection string'i kullanın

## ⚠️ Önemli Notlar

1. **Database Adı:** Connection string'de `/belucha` eklenmeli
   - ❌ Yanlış: `...mongodb.net/?appName=Belucha`
   - ✅ Doğru: `...mongodb.net/belucha?retryWrites=true&w=majority`

2. **Password Encoding:** Eğer password'de özel karakterler varsa URL encode edin
   - `!` → `%21`
   - `@` → `%40`
   - `#` → `%23`

3. **PAYLOAD_SECRET:** Güçlü bir secret kullanın (min 32 karakter)

4. **Dosya Konumu:** `apps/cms/payload/.env.local` (root'ta değil!)

## 🔍 Connection String Kontrolü

**MongoDB Atlas'tan aldığınız:**
```
mongodb+srv://belucha:<db_password>@belucha.dijx1dj.mongodb.net/?appName=Belucha
```

**Düzeltilmiş hali:**
```
mongodb+srv://belucha:fDnQg90ThKO50DA8@belucha.dijx1dj.mongodb.net/belucha?retryWrites=true&w=majority
```

**Değişiklikler:**
- `<db_password>` → Gerçek password'unuz (`fDnQg90ThKO50DA8`)
- `/?appName=Belucha` → `/belucha?retryWrites=true&w=majority`
  - Database adı eklendi: `/belucha`
  - Standart parametreler eklendi: `?retryWrites=true&w=majority`

## ✅ Test

Dosyayı oluşturduktan sonra:

```bash
cd apps/cms/payload
npm run dev
```

**Başarılı loglar:**
```
✅ Loaded .env from: /path/to/.env.local
✅ Connected to MongoDB
✅ Payload Admin URL: http://localhost:3001/admin
```

