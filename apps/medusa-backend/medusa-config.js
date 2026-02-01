require('dotenv').config({ path: '.env.local' })

// Render'da PORT environment variable'ı otomatik olarak set edilir
// Medusa v2 server_url içinde port belirtilir
const PORT = process.env.PORT || 9000
const HOST = process.env.HOST || '0.0.0.0'

// Render'da SERVER_URL belirtilmemişse, PORT'tan oluştur
const SERVER_URL = process.env.SERVER_URL || (process.env.PORT 
  ? `http://${HOST}:${PORT}` 
  : 'http://localhost:9000')

module.exports = {
  projectConfig: {
    // PostgreSQL database (Render'da)
    database_url: process.env.DATABASE_URL || `file:./medusa.db`,
    database_type: process.env.DATABASE_TYPE || "sqlite",
    store_cors: process.env.STORE_CORS || "http://localhost:3000",
    admin_cors: process.env.ADMIN_CORS || "http://localhost:7001",
    database_extra: {},
    redis_url: process.env.REDIS_URL || "redis://localhost:6379",
    // Server URL - Render'da PORT environment variable'ından otomatik oluşturulur
    server_url: SERVER_URL,
  },
  plugins: [],
}
