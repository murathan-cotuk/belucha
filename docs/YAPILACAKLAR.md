# 📋 Yapılacaklar Listesi

## ✅ Tamamlananlar

1. ✅ Shop app Medusa client error handling iyileştirildi
2. ✅ Sellercentral Apollo Client hatası düzeltildi
3. ✅ GraphQL endpoint graceful error handling eklendi
4. ✅ Environment variables rehberi oluşturuldu

---

## 🎯 ŞİMDİ YAPMAN GEREKENLER

### 1. Shop App .env.local Dosyası Oluştur

**Dosya:** `apps/shop/.env.local`

**İçeriği:**
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

**Nasıl yapılır:**
1. `apps/shop/` klasörüne git
2. `.env.local` dosyası oluştur (yoksa)
3. İçine yukarıdaki satırı yaz
4. Kaydet

---

### 2. Vercel - Shop App Projesi

**Proje:** Shop App (belucha-shop veya benzeri)

**Adımlar:**
1. Vercel Dashboard'a git
2. **Shop App** projesini seç
3. Settings → Environment Variables
4. "Add New" butonuna tıkla
5. Şunları gir:
   - **Key:** `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
   - **Value:** `http://localhost:9000` (şimdilik)
   - **Environment:** Production, Preview, Development (hepsini seç)
6. Save

---

### 3. Vercel - Sellercentral Projesi (Opsiyonel)

**Proje:** Sellercentral (belucha-sellercentral veya benzeri)

**Adımlar:**
1. Vercel Dashboard'a git
2. **Sellercentral** projesini seç
3. Settings → Environment Variables
4. "Add New" butonuna tıkla
5. Şunları gir (opsiyonel, şimdilik boş bırakabilirsin):
   - **Key:** `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
   - **Value:** (boş bırak, GraphQL endpoint yok)
   - **Environment:** Production, Preview, Development
6. Save

---

## 🚀 Sonraki Adımlar (Medusa Backend Deploy Edildikten Sonra)

### Medusa Backend Railway'e Deploy Edildikten Sonra:

1. Railway'den backend URL'ini al (örn: `https://belucha-medusa.railway.app`)
2. Vercel → Shop App → Environment Variables
3. `NEXT_PUBLIC_MEDUSA_BACKEND_URL` değerini güncelle:
   - **Eski:** `http://localhost:9000`
   - **Yeni:** `https://belucha-medusa.railway.app` (Railway'den aldığın URL)
4. Save (Vercel otomatik redeploy eder)

---

## 📝 Özet

**Şimdi yap:**
1. ✅ `apps/shop/.env.local` oluştur → `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000`
2. ✅ Vercel Shop App → Environment Variables → `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000` ekle
3. ✅ (Opsiyonel) Vercel Sellercentral → Environment Variables → `NEXT_PUBLIC_GRAPHQL_ENDPOINT` ekle (boş bırakabilirsin)

**Sonra yap (Medusa deploy edilince):**
- Vercel'deki `NEXT_PUBLIC_MEDUSA_BACKEND_URL` değerini Railway URL'i ile güncelle

---

## 🔍 Kontrol

Değişikliklerden sonra:
- Local'de `npm run dev` çalıştır, hata olmamalı
- Vercel'de deployment başarılı olmalı
- Production'da "Medusa backend not available" hatası yerine graceful mesaj görmeli

---

## 📚 Detaylı Bilgi

Daha fazla bilgi için: `docs/ENVIRONMENT_VARIABLES.md`
