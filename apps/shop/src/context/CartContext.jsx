"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMedusaClient } from "@/lib/medusa-client";

const CART_ID_KEY = "belucha_cart_id";

const CartContext = createContext(null);

export { CartContext };
export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const persistCartId = useCallback((id) => {
    if (typeof window !== "undefined" && id) {
      try {
        window.localStorage.setItem(CART_ID_KEY, id);
      } catch (_) {}
    }
  }, []);

  const getStoredCartId = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(CART_ID_KEY);
    } catch (_) {
      return null;
    }
  }, []);

  const createCart = useCallback(async () => {
    const client = getMedusaClient();
    const res = await client.createCart();
    const c = res?.cart;
    if (c?.id) {
      persistCartId(c.id);
      setCart(c);
      return c;
    }
    return null;
  }, [persistCartId]);

  const fetchCart = useCallback(async (cartId) => {
    if (!cartId) return null;
    const client = getMedusaClient();
    try {
      const res = await client.getCart(cartId);
      const c = res?.cart;
      if (c) setCart(c);
      return c;
    } catch (_) {
      return null;
    }
  }, []);

  useEffect(() => {
    const id = getStoredCartId();
    if (id) fetchCart(id);
  }, [getStoredCartId, fetchCart]);

  const addToCart = useCallback(async (variantId, quantity = 1) => {
    setLoading(true);
    try {
      const client = getMedusaClient();
      let c = cart;
      if (!c?.id) {
        c = await createCart();
        if (!c) return null;
      }
      const res = await client.addToCart(c.id, variantId, quantity);
      const updated = res?.cart;
      if (updated) setCart(updated);
      return updated;
    } catch (err) {
      console.error("Add to cart failed:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cart, createCart]);

  const updateLineItem = useCallback(async (lineId, quantity) => {
    if (!cart?.id) return null;
    setLoading(true);
    try {
      const client = getMedusaClient();
      const res = await client.updateLineItem(cart.id, lineId, quantity);
      const updated = res?.cart;
      if (updated) setCart(updated);
      return updated;
    } catch (err) {
      console.error("Update line item failed:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cart?.id]);

  const removeLineItem = useCallback(async (lineId) => {
    if (!cart?.id) return null;
    setLoading(true);
    try {
      const client = getMedusaClient();
      const res = await client.removeLineItem(cart.id, lineId);
      const updated = res?.cart;
      if (updated) setCart(updated);
      return updated;
    } catch (err) {
      console.error("Remove line item failed:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cart?.id]);

  const openCartSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeCartSidebar = useCallback(() => setSidebarOpen(false), []);

  const itemCount = (cart?.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
  const subtotalCents = (cart?.items || []).reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price_cents || 0), 0);

  const value = {
    cart,
    setCart,
    sidebarOpen,
    openCartSidebar,
    closeCartSidebar,
    addToCart,
    updateLineItem,
    removeLineItem,
    createCart,
    fetchCart,
    loading,
    itemCount,
    subtotalCents,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
