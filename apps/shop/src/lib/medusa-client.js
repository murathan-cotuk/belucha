/**
 * Medusa Backend API Client
 * 
 * Medusa e-commerce backend'e bağlanmak için client
 * REST API kullanarak products, cart, orders yönetimi
 */

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

class MedusaClient {
  constructor(baseURL = MEDUSA_BACKEND_URL) {
    this.baseURL = baseURL
  }

  /**
   * Generic API request helper
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Medusa API Error (${endpoint}):`, error)
      throw error
    }
  }

  /**
   * Products
   */
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/store/products${queryParams ? `?${queryParams}` : ''}`)
  }

  async getProduct(id) {
    return this.request(`/store/products/${id}`)
  }

  /**
   * Cart
   */
  async createCart() {
    return this.request('/store/carts', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async getCart(cartId) {
    return this.request(`/store/carts/${cartId}`)
  }

  async addToCart(cartId, variantId, quantity = 1) {
    return this.request(`/store/carts/${cartId}/line-items`, {
      method: 'POST',
      body: JSON.stringify({
        variant_id: variantId,
        quantity,
      }),
    })
  }

  async updateCart(cartId, data) {
    return this.request(`/store/carts/${cartId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Orders
   */
  async createOrder(cartId, email) {
    return this.request(`/store/carts/${cartId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async getOrder(id) {
    return this.request(`/store/orders/${id}`)
  }

  /**
   * Regions (for shipping)
   */
  async getRegions() {
    return this.request('/store/regions')
  }

  /**
   * Categories (via products grouping or custom endpoint)
   */
  async getCategories() {
    // Medusa doesn't have categories by default, but we can group products
    // For now, return empty array - will be handled by custom Medusa plugin
    return this.request('/store/categories').catch(() => ({ categories: [] }))
  }

  /**
   * Customers
   */
  async registerCustomer(email, password, firstName, lastName) {
    return this.request('/store/customers', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    })
  }

  async loginCustomer(email, password) {
    return this.request('/store/auth/token', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    })
  }

  async getCustomer(token) {
    return this.request('/store/customers/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  /**
   * Health check
   */
  async health() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      return response.ok
    } catch {
      return false
    }
  }
}

// Singleton instance
let medusaClient = null

export function getMedusaClient() {
  if (!medusaClient) {
    medusaClient = new MedusaClient()
  }
  return medusaClient
}

export default MedusaClient
