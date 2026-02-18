/**
 * Region Service Loader (JavaScript)
 * Render'da .ts + manager resolve sorununu önlemek için JS; manager yoksa kendi TypeORM DataSource kullanır.
 */

const path = require('path')
const { DataSource } = require('typeorm')

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/medusa'
const isPostgres = DATABASE_URL.startsWith('postgres')
const isRender = DATABASE_URL.includes('render.com')

let regionDataSource = null

async function regionServiceLoader(container) {
  let manager
  try {
    const RegionServiceModule = require(path.join(__dirname, '..', 'services', 'region-service.ts'))
    const RegionService = RegionServiceModule.default || RegionServiceModule
    const regionMod = require(path.join(__dirname, '..', 'models', 'region.ts'))
    const productRegionMod = require(path.join(__dirname, '..', 'models', 'product-region.ts'))
    const Region = regionMod.Region || regionMod.default || regionMod
    const ProductRegion = productRegionMod.ProductRegion || productRegionMod.default || productRegionMod
    const entities = [Region, ProductRegion].filter(Boolean)

    if (!RegionService) throw new Error('RegionService could not be loaded')

    try {
      const medusaManager = container.resolve('manager')
      if (medusaManager && typeof medusaManager.getRepository === 'function') {
        manager = medusaManager
      } else {
        throw new Error('Medusa manager not TypeORM')
      }
    } catch (managerErr) {
      const config = {
        type: isPostgres ? 'postgres' : 'sqlite',
        entities,
        synchronize: false,
        logging: false,
      }
      if (isPostgres) {
        config.url = DATABASE_URL
        if (isRender) config.extra = { ssl: { rejectUnauthorized: false } }
      } else {
        config.database = (DATABASE_URL || '').replace(/^file:/, '') || 'medusa.db'
      }
      regionDataSource = new DataSource(config)
      await regionDataSource.initialize()
      manager = regionDataSource.manager
      console.warn('RegionService: Kendi TypeORM DataSource kullanılıyor (Medusa manager yok)')
    }

    container.register({
      regionService: {
        resolve: () => new RegionService({ manager }),
      },
    })
    console.log('✅ RegionService container\'a register edildi')
  } catch (err) {
    console.error('❌ regionServiceLoader failed:', err && err.message)
    if (err && err.stack) console.error(err.stack)
    throw err
  }
}

module.exports = regionServiceLoader
module.exports.default = regionServiceLoader
