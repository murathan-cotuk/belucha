import { NextResponse } from "next/server";

const getBackendUrl = () =>
  (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "");

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = (searchParams.get("handle") || "").trim();
    const base = getBackendUrl();

    if (handle) {
      const singleUrl = `${base}/store/collections?handle=${encodeURIComponent(handle)}`;
      const res = await fetch(singleUrl, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.collection) return NextResponse.json(data);
      }
      // Fallback: fetch all collections and find by handle or id (case-insensitive)
      const listRes = await fetch(`${base}/store/collections`, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        const collections = listData?.collections || [];
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(handle).trim());
        const found = collections.find(
          (c) =>
            (c?.handle && String(c.handle).toLowerCase() === handle.toLowerCase()) ||
            (isUuid && c?.id && String(c.id).toLowerCase() === String(handle).trim().toLowerCase())
        );
        if (found) return NextResponse.json({ collection: found, collections });
      }
      return NextResponse.json({ collection: null, collections: [] });
    }

    const res = await fetch(`${base}/store/collections`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ collections: [] }, { status: 200 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ collection: null, collections: [] }, { status: 200 });
  }
}
