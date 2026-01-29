'use client'

import Link from 'next/link'
import { useMedusaCart } from '@/hooks/useMedusa'

export function ProductGrid({ products = [] }) {
  const { cart, addToCart, loading: cartLoading } = useMedusaCart()

  const handleAddToCart = async (product) => {
    // Medusa products have variants
    const variantId = product.variants?.[0]?.id
    if (!variantId) {
      alert('Product variant not available')
      return
    }

    const result = await addToCart(variantId, 1)
    if (result) {
      alert('Product added to cart!')
    } else {
      alert('Failed to add product to cart')
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const image = product.images?.[0]?.url || product.thumbnail
        const price = product.variants?.[0]?.prices?.[0]?.amount || 0
        const formattedPrice = (price / 100).toFixed(2)

        return (
          <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/product/${product.handle || product.id}`}>
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/product/${product.handle || product.id}`}>
                <h3 className="font-semibold text-lg mb-2 hover:text-blue-600">
                  {product.title}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description || product.subtitle}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">${formattedPrice}</span>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={cartLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
