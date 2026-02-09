# Test ürünü oluşturma ve Shop'ta kontrol

Aşama 1’in tamamlandığını doğrulamak için: backend’de bir test ürünü oluşturup Shop’ta görünürlüğünü kontrol edin.

## Gereksinimler

- Backend çalışıyor olmalı (local: `node apps/medusa-backend/server.js` veya `npm run dev` / `medusa develop`).
- Node 18+ (script `fetch` kullanır).

## Adımlar

1. **Backend’i başlat**
   - Local: repo root’ta `node apps/medusa-backend/server.js` veya `cd apps/medusa-backend && npm run dev`.
   - Render kullanıyorsan backend zaten çalışıyordur; aşağıda `BASE_URL` ile script’i uzaktan çalıştırabilirsin.

2. **Test ürünü script’ini çalıştır**
   - **Bash (jq gerekir):**  
     `./apps/medusa-backend/tests/test-script.sh`
   - **Node (jq gerekmez):**  
     `node apps/medusa-backend/scripts/create-test-product.js`  
   - Render/uzak backend için:  
     `BASE_URL=https://your-app.onrender.com node apps/medusa-backend/scripts/create-test-product.js`  
     (Ortamda `MEDUSA_BACKEND_URL` tanımlıysa script onu da kullanır.)

3. **Shop’ta kontrol**
   - Shop’u aç (local: `http://localhost:3000` veya Vercel URL).
   - Ana sayfada ürün listesi veya `/store/products` ile ürünün göründüğünü kontrol et.
   - Script çıktısındaki **handle** ile `/product/{handle}` sayfasına gidip tek ürün detayının geldiğini doğrula.

## Çıktı

Script başarılıysa özet satırlarında **Product ID**, **Handle** ve **Store’da görünen ürün sayısı** yazar. Shop’ta aynı handle ile ürün detay sayfası açılabilir.
