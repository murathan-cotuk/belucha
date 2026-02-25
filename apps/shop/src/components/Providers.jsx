"use client";

import { CustomerAuthProvider } from "@belucha/lib";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";

export default function Providers({ children }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        {children}
        <CartSidebar />
      </CartProvider>
    </CustomerAuthProvider>
  );
}

