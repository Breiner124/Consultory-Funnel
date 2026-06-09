"use client";

import { useMemo, useState } from "react";

const TAG = {
  green: "text-[#16A34A] bg-[#ECFDF3] border-[#BBF7D0]",
  amber: "text-[#B45309] bg-[#FEF6E7] border-[#FCE3B5]",
  red: "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
};

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) +
      " " +
      d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return iso || "—";
  }
}
const waHref = (tel) => {
  const n = (tel || "").replace(/[^0-9]/g, "");
  return n ? `https://wa.me/${n}` : "#";
};

export default function AdminDashboard({ leads }) {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(() => {
    let g = 0, a = 0, r = 0;
    leads.forEach((l) => (l.score.cls === "green" ? g++ : l.score.cls === "amber" ? a++ : r++));
    return { total: leads.length, g, a, r };
  }, [leads]);

  const shown = filter === "all" ? leads : leads.filter((l) => l.score.cls === filter);

  function exportCSV() {
    const head = ["Fecha", "Nombre", "WhatsApp", "Presupuesto", "Experiencia", "Horas", "Ocupacion", "Motivo", "Scoring", "Aprobado"];
    const rows = leads.map((l) =>
      [fmtDate(l.createdAt), l.nombre, l.telefono, l.presupuesto, l.experiencia, l.horas, l.ocupacion, l.motivo, l.score.label, l.aprobado ? "Si" : "No"]
        .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob(["\uFEFF" + [head.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads-consultoria.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const stat = (n, label, color, key) => (
    <button
      onClick={() => setFilter(key)}
      className={`min-w-[130px] rounded-[14px] border bg-white px-[18px] py-3.5 text-left transition hover:shadow-sm ${
        filter === key ? "border-blue-500 ring-2 ring-blue-100" : "border-[#E7EBF0]"
      }`}
    >
      <div className="font-display text-[26px] font-extrabold" style={{ color }}>{n}</div>
      <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <div className="sticky top-0 z-10 border-b border-[#E7EBF0] bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <h2 className="font-display text-xl font-extrabold">CRM · <span className="text-blue-500">Leads de la Consultoría</span></h2>
          <div className="flex flex-wrap items-center gap-2.5">
            <a href="/admin" className="rounded-[14px] px-3.5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-[#F4F7FB] hover:text-ink">↻ Actualizar</a>
            <button onClick={exportCSV} className="rounded-[14px] px-3.5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-[#F4F7FB] hover:text-ink">⬇ Exportar CSV</button>
            <a href="/" className="rounded-[14px] bg-blue-500 px-[18px] py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">Ver formulario</a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex flex-wrap gap-3 pb-1.5 pt-5">
          {stat(counts.total, "Total leads", "#0B1220", "all")}
          {stat(counts.g, "🔥 Alto", "#16A34A", "green")}
          {stat(counts.a, "⚠️ Medio", "#B45309", "amber")}
          {stat(counts.r, "❄️ Descartado", "#DC2626", "red")}
        </div>
      </div>

      <div className="mx-auto mb-16 max-w-[1180px] overflow-x-auto px-6 pt-3.5">
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-[#E7EBF0] bg-white p-16 text-center text-ink-soft">
            Aún no hay leads. Las aplicaciones aparecerán aquí.
          </div>
        ) : (
          <table className="w-full min-w-[980px] overflow-hidden rounded-2xl border border-[#E7EBF0] bg-white text-sm">
            <thead>
              <tr className="bg-[#F1F5FB] text-left font-display text-xs uppercase tracking-wide text-ink-soft">
                {["Scoring", "Nombre / Fecha", "WhatsApp", "Presupuesto", "Experiencia", "Horas/día", "Ocupación", "Motivo"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => (
                <tr key={l.id} className="border-t border-[#E7EBF0] hover:bg-[#FAFCFF]">
                  <td className="px-4 py-3.5 align-top">
                    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1.5 font-display text-xs font-bold ${TAG[l.score.cls]}`}>
                      {l.score.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <b>{l.nombre || "—"}</b>
                    <div className="text-xs text-ink-soft">{fmtDate(l.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    {l.telefono ? (
                      <a className="font-bold text-[#1D4ED8] hover:underline" href={waHref(l.telefono)} target="_blank" rel="noopener noreferrer">{l.telefono}</a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3.5 align-top">{l.presupuesto || "—"}</td>
                  <td className="px-4 py-3.5 align-top">{l.experiencia || "—"}</td>
                  <td className="px-4 py-3.5 align-top">{l.horas || "—"}</td>
                  <td className="px-4 py-3.5 align-top">{l.ocupacion || "—"}</td>
                  <td className="max-w-[230px] px-4 py-3.5 align-top text-ink-soft">{l.motivo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
