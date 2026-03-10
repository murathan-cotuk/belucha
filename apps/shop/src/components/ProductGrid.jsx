"use client";

import { ProductCard } from "@/components/ProductCard";

export function ProductGrid({ products = [], maxColumns }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Keine Produkte vorhanden.</p>
      </div>
    );
  }

  const gridClass = maxColumns === 3
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
