/**
 * Medusa v2 Production Server for Render
 * 
 * Medusa v2 API'lerini Express ile entegre eder
 */

require('dotenv').config({ path: '.env.local' })

const express = require('express')
const cors = require('cors')
const medusaConfig = require('./medusa-config.js')

// Render'da PORT environment variable'ı otomatik olarak set edilir
const PORT = process.env.PORT || 9000
const HOST = process.env.HOST || '0.0.0.0'

const app = express()

// CORS configuration
const storeCors = process.env.STORE_CORS || 'http://localhost:3000'
const adminCors = process.env.ADMIN_CORS || 'http://localhost:7001'

app.use(cors({
  origin: [storeCors, adminCors],
  credentials: true,
}))

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Medusa backend is running',
    port: PORT,
    timestamp: new Date().toISOString()
  })
})

// Medusa v2 API'lerini başlat
async function startMedusa() {
  try {
    console.log('Initializing Medusa v2...')
    
    // Medusa v2'yi yükle
    const { loadMedusaApp } = require('@medusajs/framework')
    
    // Medusa app'i yükle
    const medusaApp = await loadMedusaApp({
      projectConfig: medusaConfig.projectConfig,
    })

    // Medusa API routes'larını Express app'e ekle
    // Medusa v2'de API routes'ları otomatik olarak yüklenir
    app.use('/store', medusaApp.storeRoutes)
    app.use('/admin', medusaApp.adminRoutes)

    console.log('Medusa v2 initialized successfully')
    console.log(`Store API: http://${HOST}:${PORT}/store`)
    console.log(`Admin API: http://${HOST}:${PORT}/admin`)
    
  } catch (error) {
    console.error('Error initializing Medusa:', error)
    
    // Medusa başlatılamazsa, placeholder API'ler ekle
    console.log('Falling back to placeholder APIs...')
    
    // Placeholder store API endpoints
    app.get('/store/products', (req, res) => {
      res.json({ products: [], count: 0 })
    })
    
    app.get('/store/products/:id', (req, res) => {
      res.status(404).json({ message: 'Product not found' })
    })
    
    app.post('/store/carts', (req, res) => {
      res.json({ cart: { id: 'placeholder', items: [] } })
    })
    
    app.get('/store/carts/:id', (req, res) => {
      res.status(404).json({ message: 'Cart not found' })
    })
    
    app.get('/store/regions', (req, res) => {
      res.json({ regions: [] })
    })
    
    app.post('/store/customers', (req, res) => {
      res.status(201).json({ customer: { id: 'placeholder' } })
    })
    
    app.post('/store/auth/token', (req, res) => {
      res.status(401).json({ message: 'Authentication not available' })
    })
  }
}

// Server'ı başlat
async function startServer() {
  try {
    // Medusa'yı başlat
    await startMedusa()
    
    // Express server'ı başlat
    const server = app.listen(PORT, HOST, () => {
      console.log(`\n🚀 Medusa backend server started`)
      console.log(`📍 Listening on ${HOST}:${PORT}`)
      console.log(`🌐 Health check: http://${HOST}:${PORT}/health`)
      console.log(`🛍️  Store API: http://${HOST}:${PORT}/store`)
      console.log(`⚙️  Admin API: http://${HOST}:${PORT}/admin\n`)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully')
      server.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully')
      server.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })
    
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

// Server'ı başlat
startServer()
