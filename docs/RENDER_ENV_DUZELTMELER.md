# 🔧 Render Environment Variables Düzeltmeleri

## ⚠️ Düzeltilmesi Gerekenler

### 1. STORE_CORS - Sonundaki `/` Kaldır

**Şu anki:** `https://belucha-shop.vercel.app/`

**Olması gereken:** `https://belucha-shop.vercel.app`

**Neden:** Sonundaki `/` CORS hatasına neden olabilir.

**Düzeltme:**
1. Render → belucha-medusa-backend → Environment
2. `STORE_CORS` variable'ını bul
3. Value'yu düzenle: `https://belucha-shop.vercel.app` (sonundaki `/` kaldır)
4. Save Changes

---

### 2. ADMIN_CORS - `/admin` Ekle

**Şu anki:** `https://belucha-medusa-backend.onrender.com`

**Olması gereken:** `https://belucha-medusa-backend.onrender.com/admin`

**Neden:** Medusa admin panel `/admin` endpoint'inde çalışır.

**Düzeltme:**
1. Render → belucha-medusa-backend → Environment
2. `ADMIN_CORS` variable'ını bul
3. Value'yu düzenle: `https://belucha-medusa-backend.onrender.com/admin`
4. Save Changes

---

### 3. REDIS_URL - Placeholder Kaldır

**Şu anki:** `<Redis Internal Redis URL>`

**Sorun:** Redis eklemediysen, bu variable'ı sil veya boş bırak.

**Seçenek 1: Variable'ı Sil (Önerilen)**
1. Render → belucha-medusa-backend → Environment
2. `REDIS_URL` variable'ını bul
3. "Delete" veya çöp kutusu ikonuna tıkla
4. Save Changes

**Seçenek 2: Boş Bırak**
1. Render → belucha-medusa-backend → Environment
2. `REDIS_URL` variable'ını bul
3. Value'yu boş bırak: `` (hiçbir şey yazma)
4. Save Changes

**Not:** Medusa Redis olmadan da çalışır, ama cache ve queue için önerilir.

---

### 4. DATABASE_URL - Port Ekle (Opsiyonel)

**Şu anki:** `postgresql://medusa_user:EIUicZkgWtWBCTAyl0pXgLtzWTPK5BDM@dpg-d5uhghhr0fns73eqihug-a/medusa_seoj`

**Olması gereken:** `postgresql://medusa_user:EIUicZkgWtWBCTAyl0pXgLtzWTPK5BDM@dpg-d5uhghhr0fns73eqihug-a:5432/medusa_seoj`

**Not:** Port (5432) genelde otomatik algılanır, ama eklemek daha iyi.

**Düzeltme (opsiyonel):**
1. Render → belucha-medusa-backend → Environment
2. `DATABASE_URL` variable'ını bul
3. Hostname'den sonra `:5432` ekle
4. Save Changes

---

## ✅ Doğru Environment Variables

```
DATABASE_URL = postgresql://medusa_user:EIUicZkgWtWBCTAyl0pXgLtzWTPK5BDM@dpg-d5uhghhr0fns73eqihug-a:5432/medusa_seoj
DATABASE_TYPE = postgres
STORE_CORS = https://belucha-shop.vercel.app
ADMIN_CORS = https://belucha-medusa-backend.onrender.com/admin
REDIS_URL = (SİL veya boş bırak - Redis yok)
JWT_SECRET = v9jGVPyXYhNkIEPcOAD85RRsPv8SgYJsqD/FgJ4wa6Q=
COOKIE_SECRET = qR1itY6si1ntDASglX/OqHafAVxQuLt5hNPSwwlmJ9A=
NODE_ENV = production
```

---

## 🔐 JWT_SECRET ve COOKIE_SECRET

### Sadece Render'de Olmalı

**✅ DOĞRU:** Sadece Render → Environment Variables'da olmalı

**❌ YANLIŞ:** `.env.local` dosyasına eklemeye gerek yok

**Neden:**
- Bu değerler production'da kullanılacak
- Render'de environment variable olarak yeterli
- Local development için gerekli değil (local'de Medusa backend çalışmıyor zaten)

**Not:** Eğer local'de Medusa backend'i çalıştırmak istersen (ileride), o zaman `apps/medusa-backend/.env.local` dosyasına ekleyebilirsin. Ama şimdilik gerek yok.

---

## 📝 Yapılacaklar

1. ✅ `STORE_CORS` - Sonundaki `/` kaldır
2. ✅ `ADMIN_CORS` - `/admin` ekle
3. ✅ `REDIS_URL` - Sil veya boş bırak (Redis yok)
4. ✅ (Opsiyonel) `DATABASE_URL` - Port ekle (`:5432`)

---

## 🎯 Kontrol Listesi

- [ ] STORE_CORS düzeltildi (sonundaki `/` kaldırıldı)
- [ ] ADMIN_CORS düzeltildi (`/admin` eklendi)
- [ ] REDIS_URL silindi veya boş bırakıldı
- [ ] (Opsiyonel) DATABASE_URL'e port eklendi
- [ ] Deploy başarılı mı kontrol et
