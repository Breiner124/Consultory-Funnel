import { NextResponse } from "next/server";
import { deleteLead, updateEstado } from "@/lib/db";

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

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const estado = (body.estado || "").toString();
    const validos = ["nuevo", "contactado", "negociacion", "cerrado", "no_responde"];
    if (!id || !validos.includes(estado))
      return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
    await updateEstado(id, estado);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error actualizando estado:", e);
    return NextResponse.json({ ok: false, error: "No se pudo actualizar" }, { status: 500 });
  }
}
