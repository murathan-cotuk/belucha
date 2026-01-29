require('dotenv').config({ path: '.env.local' })

module.exports = {
  projectConfig: {
    // SQLite database
    database_url: process.env.DATABASE_URL || `file:./medusa.db`,
    database_type: process.env.DATABASE_TYPE || "sqlite",
    store_cors: process.env.STORE_CORS || "http://localhost:3000",
    admin_cors: process.env.ADMIN_CORS || "http://localhost:7001",
    database_extra: {},
    redis_url: process.env.REDIS_URL || "redis://localhost:6379",
    // Server port
    server_url: process.env.SERVER_URL || "http://localhost:9000",
  },
  plugins: [],
}
