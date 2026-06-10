import { NextResponse } from "next/server";
import { countLeads } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Base inicial de prueba social: arranca mostrando 15 y suma los reales.
const BASE = 15;

export async function GET() {
  try {
    const real = await countLeads();
    return NextResponse.json({ count: BASE + real });
  } catch (e) {
    return NextResponse.json({ count: BASE });
  }
}
