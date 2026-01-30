"use client";

import Navbar from "@/components/Navbar";
import SlimBar from "@/components/SlimBar";
import Footer from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";

export default function BestsellersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SlimBar />
      <main className="flex-grow">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "16px", letterSpacing: "0.05em" }}>
            Bestsellers
          </h1>
          <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "32px" }}>
            Unsere meistverkauften Produkte
          </p>
        </div>
        <ProductGrid products={[]} />
      </main>
      <Footer />
    </div>
  );
}

