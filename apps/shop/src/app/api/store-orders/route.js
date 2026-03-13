import { NextResponse } from "next/server";

const getBackendUrl = () =>
  (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "");

export async function POST(request) {
  try {
    const body = await request.json();
    const base = getBackendUrl();
    const res = await fetch(`${base}/store/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : res.status });
  } catch {
    return NextResponse.json({ message: "Order creation failed" }, { status: 500 });
  }
}
