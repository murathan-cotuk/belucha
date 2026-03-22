"use client";

import { useAuthGuard, useCustomerAuth as useAuth } from "@belucha/lib";
import { useRouter } from "@/i18n/navigation";
import ShopHeader from "@/components/ShopHeader";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";

const GRAY = "#6b7280";
const DARK = "#1A1A1A";

export default function ReviewsPage() {
  useAuthGuard({ requiredRole: "customer", redirectTo: "/login" });
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fafafa" }}>
      <ShopHeader />
      <main style={{ flex: 1, padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: "0 0 24px" }}>Bewertungen</h1>
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
            <AccountSidebar onLogout={() => { logout(); router.push("/"); }} />
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 28 }}>
              <p style={{ color: GRAY, margin: 0, lineHeight: 1.6 }}>
                Hier erscheint demnächst eine Liste Ihrer Produktbewertungen. Diese Funktion wird derzeit vorbereitet.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
