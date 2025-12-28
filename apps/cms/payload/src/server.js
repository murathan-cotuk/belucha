import express from 'express'
import payload from 'payload'
import config from './payload.config.js'

// Production: Fail-fast if required env vars are missing
if (!process.env.PAYLOAD_SECRET) {
  console.error('❌ PAYLOAD_SECRET is required but not set')
  process.exit(1)
}

const mongoUrl = process.env.PAYLOAD_MONGO_URL || process.env.DATABASE_URI || process.env.MONGODB_URI
if (!mongoUrl) {
  console.error('❌ Database URL is required. Set PAYLOAD_MONGO_URL, DATABASE_URI, or MONGODB_URI environment variable.')
  process.exit(1)
}

const app = express()

// CORS middleware - must be before other middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://belucha-shop.vercel.app',
  'https://belucha-sellercentral.vercel.app',
  'https://sellercentral.vercel.app',
  'https://belucha-cms.railway.app',
  'https://beluchacms-production.up.railway.app',
]

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Essential Express middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const start = async () => {
  try {
    // Initialize Payload CMS
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      express: app,
      config,
      onInit: async () => {
        payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
        payload.logger.info(`GraphQL API: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/graphql`)
      },
    })

    // Redirect root to admin
    app.get('/', (_, res) => {
      res.redirect('/admin')
    })

    // Start server
    const port = process.env.PORT || 3001
    app.listen(port, '0.0.0.0', () => {
      payload.logger.info(`Server listening on port ${port}`)
    })
  } catch (error) {
    console.error('❌ Error initializing Payload CMS:', error)
    process.exit(1)
  }
}

start()
