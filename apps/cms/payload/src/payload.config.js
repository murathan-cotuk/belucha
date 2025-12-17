import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import Products from './collections/Products.js'
import Categories from './collections/Categories.js'
import Brands from './collections/Brands.js'
import Sellers from './collections/Sellers.js'
import Customers from './collections/Customers.js'
import Orders from './collections/Orders.js'
import Media from './collections/Media.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET is missing')
}

if (!process.env.PAYLOAD_MONGO_URL) {
  throw new Error('PAYLOAD_MONGO_URL is missing')
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET,

  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,

  admin: {
    user: 'sellers',
  },

  routes: {
    admin: '/admin',
    api: '/api',
    graphQL: '/api/graphql',
  },

  collections: [
    Products,
    Categories,
    Brands,
    Sellers,
    Customers,
    Orders,
    Media,
  ],

  editor: lexicalEditor({}),

  db: mongooseAdapter({
    url: process.env.PAYLOAD_MONGO_URL,
  }),

  cors: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://belucha-shop.vercel.app',
    'https://belucha-sellercentral.vercel.app',
  ],

  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
