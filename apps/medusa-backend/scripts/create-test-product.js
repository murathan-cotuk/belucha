/**
 * Test ürünü oluşturma (jq gerektirmez; Node ile aynı adımları yapar).
 * Backend çalışıyor olmalı: node server.js veya medusa develop
 *
 * Kullanım:
 *   node apps/medusa-backend/scripts/create-test-product.js
 *   BASE_URL=https://your-backend.onrender.com node apps/medusa-backend/scripts/create-test-product.js
 */

const BASE_URL = process.env.BASE_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";

async function request(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(data.message || res.statusText || text.slice(0, 200));
  return data;
}

async function main() {
  console.log("Test ürünü oluşturuluyor... (BASE_URL:", BASE_URL, ")\n");

  let regionId, productId, storeCount;

  try {
    const ts = Date.now();
    const regionRes = await request("POST", "/admin/regions", {
      name: "Germany",
      code: "DE",
      currency_code: "EUR",
    });
    regionId = regionRes.region?.id;
    if (!regionId) throw new Error("Region id dönmedi");
    console.log("1. Region oluşturuldu:", regionId);

    const productRes = await request("POST", "/admin/products", {
      title: "Test Product",
      description: "Test product for Shop visibility",
      handle: `test-product-${ts}`,
      is_giftcard: false,
      status: "published",
      images: [],
      options: [],
      variants: [
        {
          title: "Default Variant",
          sku: `TEST-SKU-${ts}`,
          prices: [{ amount: 1000, currency_code: "EUR" }],
          inventory_quantity: 10,
        },
      ],
    });
    productId = productRes.product?.id;
    if (!productId) throw new Error("Product id dönmedi");
    const handle = productRes.product?.handle || productRes.product?.title;
    console.log("2. Product oluşturuldu:", productId, "handle:", handle);

    await request("POST", `/admin/regions/${regionId}/products`, {
      product_id: productId,
    });
    console.log("3. Product region'a bağlandı");

    const storeRes = await request("GET", "/store/products");
    const products = storeRes.products || [];
    storeCount = Array.isArray(products) ? products.length : (storeRes.count ?? 0);
    console.log("4. Store products count:", storeCount);

    console.log("\nÖzet:");
    console.log("  Product ID:", productId);
    console.log("  Handle:", handle);
    console.log("  Store'da görünen ürün sayısı:", storeCount);
    console.log("\nShop'ta kontrol: Ana sayfa veya /product/" + (handle || productId));
  } catch (err) {
    console.error("Hata:", err.message);
    process.exit(1);
  }
}

main();
