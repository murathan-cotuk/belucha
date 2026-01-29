"use client";

import { CustomerAuthProvider } from "@belucha/lib";

export default function Providers({ children }) {
  return (
    <CustomerAuthProvider>{children}</CustomerAuthProvider>
  );
}

