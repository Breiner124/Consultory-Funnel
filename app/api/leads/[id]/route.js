import { NextResponse } from "next/server";
import { deleteLead } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ ok: false, error: "ID requerido" }, { status: 400 });
    await deleteLead(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error eliminando lead:", e);
    return NextResponse.json({ ok: false, error: "No se pudo eliminar" }, { status: 500 });
  }
}
