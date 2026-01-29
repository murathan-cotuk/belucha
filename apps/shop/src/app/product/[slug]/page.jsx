"use client";

import Navbar from "@/components/Navbar";
import SlimBar from "@/components/SlimBar";
import Footer from "@/components/Footer";
import ProductTemplate from "@/components/templates/ProductTemplate";

export default function ProductPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SlimBar />
      <main className="flex-grow">
        <ProductTemplate />
      </main>
      <Footer />
    </div>
  );
}

