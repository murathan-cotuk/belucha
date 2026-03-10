"use client";

import { UnsavedChangesProvider } from "@/context/UnsavedChangesContext";

export default function Providers({ children }) {
  return (
    <UnsavedChangesProvider>
      {children}
    </UnsavedChangesProvider>
  );
}
