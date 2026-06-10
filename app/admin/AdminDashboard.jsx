"use client";

import { useMemo, useState } from "react";

const TAG = {
  green:  "text-[#16A34A] bg-[#ECFDF3] border-[#BBF7D0]",
  amber:  "text-[#B45309] bg-[#FEF6E7] border-[#FCE3B5]",
  orange: "text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]",
  red:    "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
};

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) +
      " " +
      d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    );
  } catch { return iso || "—"; }
}
const waHref = (tel) => {
  const n = (tel || "").replace(/[^0-9]/g, "");
  return n ? `https://wa.me/${n}` : "#";
};

export default function AdminDashboard({ leads: initial }) {
  const [leads, setLeads]   = useState(initial);
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  const ESTADOS = {
    nuevo:       { label: "🆕 Nuevo",          color: "#475569", bg: "#F1F5F9" },
    contactado:  { label: "📞 Contactado",     color: "#1D4ED8", bg: "#EFF5FF" },
    negociacion: { label: "💬 En negociación", color: "#B45309", bg: "#FEF6E7" },
    cerrado:     { label: "✅ Cerrado",         color: "#16A34A", bg: "#ECFDF3" },
    no_responde: { label: "❌ No responde",     color: "#DC2626", bg: "#FEF2F2" },
  };

  async function changeEstado(id, estado) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estado } : l)));
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
    } catch { /* el cambio visual ya quedó; se reintenta al recargar */ }
  }

  const counts = useMemo(() => {
    let g=0, a=0, o=0, r=0;
    leads.forEach((l) => {
      const c = l.score.cls;
      if (c === "green") g++;
      else if (c === "amber") a++;
      else if (c === "orange") o++;
      else r++;
    });
    return { total: leads.length, g, a, o, r };
  }, [leads]);

  const shown = filter === "all" ? leads : leads.filter((l) => l.score.cls === filter);

  async function deleteLead(id) {
    if (!confirm("¿Eliminar este lead? Esta acción no se puede deshacer.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) setLeads((prev) => prev.filter((l) => l.id !== id));
      else alert("No se pudo eliminar. Intenta de nuevo.");
    } catch { alert("Error de red. Intenta de nuevo."); }
    setDeleting(null);
  }

  async function deleteAllDiscarded() {
    const discarded = leads.filter((l) => l.score.cls === "red");
    if (!discarded.length) return alert("No hay leads descartados.");
    if (!confirm(`¿Eliminar ${discarded.length} lead(s) descartado(s)?`)) return;
    for (const l of discarded) {
      await fetch(`/api/leads/${l.id}`, { method: "DELETE" });
    }
    setLeads((prev) => prev.filter((l) => l.score.cls !== "red"));
  }

  function exportCSV() {
    const head = ["Fecha","Nombre","WhatsApp","Presupuesto","Experiencia","Horas","Ocupacion","Motivo","Scoring","Estado","Aprobado"];
    const ESTADO_CSV = { nuevo:"Nuevo", contactado:"Contactado", negociacion:"En negociacion", cerrado:"Cerrado", no_responde:"No responde" };
    const rows = leads.map((l) =>
      [fmtDate(l.createdAt), l.nombre, l.telefono, l.presupuesto, l.experiencia,
       l.horas, l.ocupacion, l.motivo, l.score.label, ESTADO_CSV[l.estado] || "Nuevo", l.aprobado ? "Si" : "No"]
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
      {/* barra superior */}
      <div className="sticky top-0 z-10 border-b border-[#E7EBF0] bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <h2 className="font-display text-xl font-extrabold">
            CRM · <span className="text-blue-500">Leads de la Consultoría</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2.5">
            <a href="/admin" className="rounded-[14px] px-3.5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-[#F4F7FB] hover:text-ink">↻ Actualizar</a>
            <button onClick={exportCSV} className="rounded-[14px] px-3.5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-[#F4F7FB] hover:text-ink">⬇ Exportar CSV</button>
            <button
              onClick={deleteAllDiscarded}
              className="rounded-[14px] px-3.5 py-2.5 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2]"
            >🗑 Eliminar descartados</button>
            <a href="/" className="rounded-[14px] bg-blue-500 px-[18px] py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">Ver formulario</a>
          </div>
        </div>
      </div>

      {/* contadores */}
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex flex-wrap gap-3 pb-1.5 pt-5">
          {stat(counts.total, "Total leads",    "#0B1220", "all")}
          {stat(counts.g,     "🔥 Alto",        "#16A34A", "green")}
          {stat(counts.a,     "⚠️ Medio",       "#B45309", "amber")}
          {stat(counts.o,     "🧊 Medio-Bajo",  "#C2410C", "orange")}
          {stat(counts.r,     "❄️ Descartado",  "#DC2626", "red")}
        </div>
      </div>

      {/* tabla */}
      <div className="mx-auto mb-16 max-w-[1180px] overflow-x-auto px-6 pt-3.5">
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-[#E7EBF0] bg-white p-16 text-center text-ink-soft">
            Aún no hay leads en esta categoría.
          </div>
        ) : (
          <table className="w-full min-w-[1140px] overflow-hidden rounded-2xl border border-[#E7EBF0] bg-white text-sm">
            <thead>
              <tr className="bg-[#F1F5FB] text-left font-display text-xs uppercase tracking-wide text-ink-soft">
                {["Scoring","Estado","Nombre / Fecha","WhatsApp","Presupuesto","Experiencia","Horas/día","Ocupación","Motivo",""].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => (
                <tr key={l.id} className={`border-t border-[#E7EBF0] transition ${deleting === l.id ? "opacity-40" : "hover:bg-[#FAFCFF]"}`}>
                  <td className="px-4 py-3.5 align-top">
                    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1.5 font-display text-xs font-bold ${TAG[l.score.cls]}`}>
                      {l.score.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <select
                      value={l.estado || "nuevo"}
                      onChange={(e) => changeEstado(l.id, e.target.value)}
                      className="cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-bold outline-none"
                      style={{
                        color: (ESTADOS[l.estado] || ESTADOS.nuevo).color,
                        background: (ESTADOS[l.estado] || ESTADOS.nuevo).bg,
                        borderColor: "transparent",
                      }}
                    >
                      {Object.entries(ESTADOS).map(([key, v]) => (
                        <option key={key} value={key}>{v.label}</option>
                      ))}
                    </select>
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
                  <td className="max-w-[200px] px-4 py-3.5 align-top text-ink-soft">{l.motivo || "—"}</td>
                  <td className="px-4 py-3.5 align-top">
                    <button
                      onClick={() => deleteLead(l.id)}
                      disabled={deleting === l.id}
                      title="Eliminar lead"
                      className="rounded-lg px-2.5 py-1.5 text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:opacity-40"
                    >🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
