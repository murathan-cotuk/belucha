"use client";

import ShopHeader from "@/components/ShopHeader";
import Footer from "@/components/Footer";
import ProductTemplate from "@/components/templates/ProductTemplate";

export default function ProductPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-grow">
        <ProductTemplate />
      </main>
      <Footer />
    </div>
  );
}

