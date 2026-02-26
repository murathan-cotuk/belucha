import { NextResponse } from "next/server";

const getBackendUrl = () =>
  (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "");

export async function GET() {
  try {
    const base = getBackendUrl();
    const res = await fetch(`${base}/store/menu-locations`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return NextResponse.json({ locations: [] }, { status: 200 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ locations: [] }, { status: 200 });
  }
}
