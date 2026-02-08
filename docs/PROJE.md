# BELUCHA – Proje

## Render (Medusa backend)

**Root Directory = repo kökü (belucha):**
- **Build Command:** `npm install && node apps/medusa-backend/scripts/patch-link-modules.js && (cd apps/medusa-backend && npm run build || true)`
- **Start Command:** `node apps/medusa-backend/server.js`

**Root Directory = apps/medusa-backend:**
- **Build Command:** `npm install && node scripts/patch-link-modules.js && (npm run build || true)`
- **Start Command:** `node server.js`

Patch her iki senaryoda da Build Command içinde açıkça çalışır.
