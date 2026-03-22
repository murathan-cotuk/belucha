"use client";

import { CustomerAuthProvider } from "@belucha/lib";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartSidebar from "@/components/CartSidebar";

export default function Providers({ children }) {
  return (
    <CustomerAuthProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
      </WishlistProvider>
    </CustomerAuthProvider>
  );
}

