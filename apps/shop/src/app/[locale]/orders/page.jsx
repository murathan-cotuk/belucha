"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuthGuard, getToken } from "@belucha/lib";
import { Link } from "@/i18n/navigation";
import ShopHeader from "@/components/ShopHeader";
import Footer from "@/components/Footer";
import { getMedusaClient } from "@/lib/medusa-client";
import { formatPriceCents } from "@/lib/format";

function StatusBadge({ status, labels }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {labels[status] || status}
    </span>
  );
}

export default function OrdersPage() {
  const t = useTranslations("pages.orders");
  useAuthGuard({ requiredRole: "customer", redirectTo: "/login" });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getToken("customer");
        if (!token) { setLoading(false); return; }
        const client = getMedusaClient();
        const res = await client.request("/store/orders/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res?.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusLabels = {
    pending: t("statuses.pending"),
    processing: t("statuses.processing"),
    shipped: t("statuses.shipped"),
    delivered: t("statuses.delivered"),
    completed: t("statuses.completed"),
    cancelled: t("statuses.cancelled"),
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ShopHeader />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/account" className="text-blue-500 hover:underline text-sm">
              ← {t("back")}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          </div>

          {loading && (
            <div className="text-center py-16 text-gray-400">
              <i className="fas fa-spinner fa-spin text-3xl" />
              <p className="mt-3">{t("loading")}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {t("error")}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-16">
              <i className="fas fa-box-open text-5xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">{t("empty")}</p>
              <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700">
                Shop
              </Link>
            </div>
          )}

          {orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const total = order.total != null
                  ? formatPriceCents(order.total)
                  : order.subtotal != null
                    ? formatPriceCents(order.subtotal)
                    : "—";
                const date = order.created_at
                  ? new Date(order.created_at).toLocaleDateString()
                  : "—";
                const itemCount = order.items?.length ?? 0;

                return (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {t("orderNumber")}{order.display_id || order.id?.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{t("date")}: {date}</p>
                        <p className="text-sm text-gray-500">{t("items")}: {itemCount}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={order.fulfillment_status || order.status || "pending"} labels={statusLabels} />
                        <p className="font-bold text-gray-900 mt-2">{total} €</p>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm text-gray-600">
                            <span>{item.title} × {item.quantity}</span>
                            <span>{formatPriceCents(item.unit_price || item.unit_price_cents || 0)} €</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
