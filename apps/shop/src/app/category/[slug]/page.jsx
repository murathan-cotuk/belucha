"use client";

import Navbar from "@/components/Navbar";
import SlimBar from "@/components/SlimBar";
import Footer from "@/components/Footer";
import CategoryTemplate from "@/components/templates/CategoryTemplate";

export default function CategoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SlimBar />
      <main className="flex-grow">
        <CategoryTemplate />
      </main>
      <Footer />
    </div>
  );
}

