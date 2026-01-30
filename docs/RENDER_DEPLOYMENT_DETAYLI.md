# 🚀 Render Deploy - DETAYLI ADIM ADIM REHBER

## 📋 ADIM 1: PostgreSQL Database Ekleme

### Render Dashboard'da PostgreSQL Nasıl Bulunur?

1. **Render Dashboard'a git:** https://dashboard.render.com
2. **Sol üstte "New +" butonuna tıkla**
3. **Açılan menüden "PostgreSQL" seçeneğini bul**
   - Eğer göremiyorsan, "Database" veya "Add Database" yazısına tıkla
   - Veya "Browse All" → "PostgreSQL" seç

### PostgreSQL Ayarları:

**Name:** `belucha-medusa-db` (veya istediğin isim)

**Database:** `medusa` (veya istediğin isim)

**User:** `medusa_user` (veya istediğin isim)

**Region:** `Frankfurt` (veya en yakın bölge - web service ile aynı olmalı)

**PostgreSQL Version:** `Latest` (varsayılan)

**Plan:** `Free` (veya istediğin plan)

**"Create Database" butonuna tıkla**

### PostgreSQL URL'ini Alma:

1. PostgreSQL oluşturulduktan sonra, **PostgreSQL service'ine tıkla**
2. **"Connections" sekmesine git**
3. **"Internal Database URL"** satırını bul
4. **URL'i kopyala** (şöyle görünür: `postgresql://medusa_user:password@dpg-xxxxx-a.frankfurt-postgres.render.com:5432/medusa`)

**⚠️ ÖNEMLİ:** "Internal Database URL" kullan, "External Database URL" değil!

---

## 📋 ADIM 2: Redis Ekleme (Opsiyonel)

### Render Dashboard'da Redis Nasıl Bulunur?

1. **Render Dashboard → "New +" butonuna tıkla**
2. **"Redis" seçeneğini bul**
   - Eğer göremiyorsan, "Browse All" → "Redis" seç

### Redis Ayarları:

**Name:** `belucha-medusa-redis`

**Region:** `Frankfurt` (web service ile aynı)

**Plan:** `Free`

**"Create Redis" butonuna tıkla**

### Redis URL'ini Alma:

1. Redis oluşturulduktan sonra, **Redis service'ine tıkla**
2. **"Connections" sekmesine git**
3. **"Internal Redis URL"** satırını bul
4. **URL'i kopyala** (şöyle görünür: `rediss://default:password@dpg-xxxxx-a.frankfurt-redis.render.com:6379`)

**⚠️ ÖNEMLİ:** "Internal Redis URL" kullan!

---

## 📋 ADIM 3: Environment Variables Doldurma

### Web Service → Environment Sekmesi

1. **Web Service'in sayfasına git**
2. **Sol menüden "Environment" sekmesine tıkla**
3. **"Add Environment Variable" butonuna tıkla**

### Her Variable İçin Ne Yazacaksın:

#### 1. DATABASE_URL

**Key:** `DATABASE_URL`

**Value:** PostgreSQL'den kopyaladığın "Internal Database URL"
- Örnek: `postgresql://medusa_user:password123@dpg-abc123-a.frankfurt-postgres.render.com:5432/medusa`
- PostgreSQL → Connections → Internal Database URL'den kopyala

**"Save Changes" tıkla**

---

#### 2. DATABASE_TYPE

**Key:** `DATABASE_TYPE`

**Value:** `postgres`
- Sadece bu kelimeyi yaz: `postgres`

**"Save Changes" tıkla**

---

#### 3. STORE_CORS

**Key:** `STORE_CORS`

**Value:** Shop app'inin Vercel URL'i
- Vercel Dashboard → Shop App → Settings → Domains
- Vercel URL'ini bul (örn: `https://belucha-shop.vercel.app`)
- Veya custom domain varsa onu kullan

**Örnek değerler:**
- `https://belucha-shop.vercel.app`
- `https://shop.belucha.com` (custom domain varsa)

**"Save Changes" tıkla**

---

#### 4. ADMIN_CORS

**Key:** `ADMIN_CORS`

**Value:** Admin panel URL'i
- Medusa admin panel için URL
- Şimdilik: `https://belucha-medusa-backend.onrender.com/admin` (Render domain'in)
- Veya ayrı bir admin domain'in varsa onu kullan

**Örnek değerler:**
- `https://belucha-medusa-backend.onrender.com/admin`
- `https://admin.belucha.com` (custom domain varsa)

**"Save Changes" tıkla**

---

#### 5. REDIS_URL

**Key:** `REDIS_URL`

**Value:** Redis'ten kopyaladığın "Internal Redis URL"
- Örnek: `rediss://default:password123@dpg-xyz789-a.frankfurt-redis.render.com:6379`
- Redis → Connections → Internal Redis URL'den kopyala

**⚠️ NOT:** Eğer Redis eklemediysen, bu variable'ı ekleme veya boş bırak. Medusa Redis olmadan da çalışır (ama önerilir).

**"Save Changes" tıkla**

---

#### 6. JWT_SECRET

**Key:** `JWT_SECRET`

**Value:** Rastgele güçlü bir string (en az 32 karakter)

**Nasıl oluşturulur:**
1. Online generator kullan: https://randomkeygen.com/ → "CodeIgniter Encryption Keys" → 64 karakter seç
2. Veya terminal'de: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Veya kendin yaz: `my-super-secret-jwt-key-2024-belucha-medusa-backend-production`

**Örnek değer:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**"Save Changes" tıkla**

---

#### 7. COOKIE_SECRET

**Key:** `COOKIE_SECRET`

**Value:** Rastgele güçlü bir string (en az 32 karakter, JWT_SECRET'ten farklı olmalı)

**Nasıl oluşturulur:**
1. Online generator kullan: https://randomkeygen.com/ → "CodeIgniter Encryption Keys" → 64 karakter seç
2. Veya terminal'de: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Veya kendin yaz: `my-super-secret-cookie-key-2024-belucha-medusa-backend-production`

**Örnek değer:**
```
z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
```

**⚠️ ÖNEMLİ:** JWT_SECRET ve COOKIE_SECRET farklı olmalı!

**"Save Changes" tıkla**

---

#### 8. NODE_ENV

**Key:** `NODE_ENV`

**Value:** `production`
- Sadece bu kelimeyi yaz: `production`

**"Save Changes" tıkla**

---

## 📋 ADIM 4: Vercel URL'lerini Bulma

### Shop App Vercel URL'i:

1. **Vercel Dashboard'a git:** https://vercel.com/dashboard
2. **Shop App projesine tıkla**
3. **Settings → Domains** sekmesine git
4. **Vercel URL'ini bul:**
   - Örnek: `https://belucha-shop.vercel.app`
   - Veya custom domain varsa onu kullan

### Admin Panel URL'i:

- Şimdilik Render domain'in + `/admin` ekle
- Örnek: `https://belucha-medusa-backend.onrender.com/admin`
- Veya ayrı bir admin domain'in varsa onu kullan

---

## ✅ Özet - Ne Yazacaksın:

### PostgreSQL:
1. Render → New + → PostgreSQL
2. Name: `belucha-medusa-db`
3. Plan: Free
4. Create
5. PostgreSQL → Connections → **Internal Database URL** kopyala

### Redis (Opsiyonel):
1. Render → New + → Redis
2. Name: `belucha-medusa-redis`
3. Plan: Free
4. Create
5. Redis → Connections → **Internal Redis URL** kopyala

### Environment Variables (Web Service → Environment):

```
DATABASE_URL = <PostgreSQL Internal Database URL'den kopyala>
DATABASE_TYPE = postgres
STORE_CORS = https://belucha-shop.vercel.app (Vercel'den al)
ADMIN_CORS = https://belucha-medusa-backend.onrender.com/admin (Render domain + /admin)
REDIS_URL = <Redis Internal Redis URL'den kopyala> (veya boş bırak)
JWT_SECRET = <64 karakter rastgele string>
COOKIE_SECRET = <64 karakter rastgele string (JWT'den farklı)>
NODE_ENV = production
```

---

## 🔧 Hızlı JWT ve Cookie Secret Oluşturma

Terminal'de çalıştır:

```bash
# JWT_SECRET için:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# COOKIE_SECRET için (tekrar çalıştır, farklı olacak):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Veya online: https://randomkeygen.com/ → "CodeIgniter Encryption Keys" → 64 karakter seç

---

## 📝 Kontrol Listesi

- [ ] PostgreSQL oluşturuldu
- [ ] PostgreSQL Internal Database URL kopyalandı
- [ ] Redis oluşturuldu (opsiyonel)
- [ ] Redis Internal Redis URL kopyalandı (opsiyonel)
- [ ] DATABASE_URL eklendi
- [ ] DATABASE_TYPE=postgres eklendi
- [ ] STORE_CORS eklendi (Vercel Shop URL'i)
- [ ] ADMIN_CORS eklendi (Render domain + /admin)
- [ ] REDIS_URL eklendi (veya boş bırakıldı)
- [ ] JWT_SECRET eklendi (64 karakter)
- [ ] COOKIE_SECRET eklendi (64 karakter, JWT'den farklı)
- [ ] NODE_ENV=production eklendi

---

## 🆘 Sorun mu Yaşıyorsun?

### PostgreSQL Bulamıyorum:
- Render Dashboard → Sol üstte "New +" → "Browse All" → "PostgreSQL"

### URL'leri Bulamıyorum:
- PostgreSQL/Redis service'ine tıkla → "Connections" sekmesi → "Internal" URL'leri kullan

### JWT_SECRET ve COOKIE_SECRET:
- Online generator: https://randomkeygen.com/
- Veya terminal'de: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Vercel URL'i Bulamıyorum:
- Vercel → Shop App → Settings → Domains → Vercel URL'ini kopyala
