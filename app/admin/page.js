import { getLeads } from "@/lib/db";
import { scoreLead } from "@/lib/scoring";
import AdminDashboard from "./AdminDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = { title: "CRM · Leads de la Consultoría" };

export default async function AdminPage() {
  let leads = [];
  try {
    const raw = await getLeads();
    leads = raw.map((l) => ({ ...l, score: scoreLead(l) }));
  } catch (e) {
    console.error("Error cargando leads:", e);
    // Carga el panel vacío si la DB falla
  }
  return <AdminDashboard leads={leads} />;
}
