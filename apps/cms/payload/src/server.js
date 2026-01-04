import express from 'express'
import payload from 'payload'
import config from './payload.config.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('✅ Loaded .env.local')
}

if (!process.env.PAYLOAD_SECRET) {
  console.error('❌ PAYLOAD_SECRET required')
  process.exit(1)
}

const mongoUrl = process.env.PAYLOAD_MONGO_URL || process.env.DATABASE_URI || process.env.MONGODB_URI
if (!mongoUrl) {
  console.error('❌ Database URL required')
  process.exit(1)
}

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  const origin = req.headers.origin
  const allowed = [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://belucha-shop.vercel.app',
    'https://belucha-sellercentral.vercel.app',
  ]
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

const start = async () => {
  try {
    const payloadInstance = await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      express: app,
      config,
    })

    console.log('✅ Payload initialized')

    app.get('/health', (_, res) => {
      res.json({ status: 'ok', payload: 'initialized' })
    })

    const port = process.env.PORT || 3001
    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server: http://localhost:${port}`)
      console.log(`✅ Admin: http://localhost:${port}/admin`)
      console.log(`✅ GraphQL: http://localhost:${port}/api/graphql`)
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

start()
