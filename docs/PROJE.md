# BELUCHA – Proje

## Render (Medusa backend)

**Root Directory = boş (repo kökü):** node_modules repo kökünde oluşur; patch root’taki kopyayı da hedefler.
- **Build Command:** `npm install && node apps/medusa-backend/scripts/patch-link-modules.js`
- **Start Command:** `node apps/medusa-backend/server.js`

**Root Directory = apps/medusa-backend:**
- **Build Command:** `npm install && node scripts/patch-link-modules.js && (npm run build || true)`
- **Start Command:** `node server.js`

Patch Build içinde açıkça çalışır. server.js runtime’da __dirname’den yukarı çıkıp **her** bulduğu node_modules/@medusajs/medusa’ya (backend + repo root) patch uygular; böylece hangi kopya resolve edilirse edilsin patch’li olur.
