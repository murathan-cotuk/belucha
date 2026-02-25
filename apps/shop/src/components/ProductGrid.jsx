"use client";

import { ProductCard } from "@/components/ProductCard";

export function ProductGrid({ products = [] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Keine Produkte vorhanden.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
