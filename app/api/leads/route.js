import { NextResponse } from "next/server";
import { saveLead } from "@/lib/db";
import { isApproved } from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const b = await req.json();
    const lead = {
      id: "lead_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      createdAt: new Date().toISOString(),
      nombre: (b.nombre || "").toString().slice(0, 200),
      motivo: (b.motivo || "").toString().slice(0, 2000),
      ocupacion: (b.ocupacion || "").toString().slice(0, 500),
      experiencia: (b.experiencia || "").toString().slice(0, 100),
      horas: (b.horas || "").toString().slice(0, 50),
      presupuesto: (b.presupuesto || "").toString().slice(0, 100),
      telefono: (b.telefono || "").toString().slice(0, 50),
      aprobado: isApproved(b.presupuesto),
    };
    await saveLead(lead);
    return NextResponse.json({ ok: true, aprobado: lead.aprobado });
  } catch (e) {
    console.error("Error guardando lead:", e);
    return NextResponse.json({ ok: false, error: "No se pudo guardar" }, { status: 500 });
  }
}
