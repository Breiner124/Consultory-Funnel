import { getLeads } from "@/lib/db";
import { scoreLead } from "@/lib/scoring";
import AdminDashboard from "./AdminDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = { title: "CRM · Leads de la Consultoría" };

export default async function AdminPage() {
  const raw = await getLeads();
  const leads = raw.map((l) => ({ ...l, score: scoreLead(l) }));
  return <AdminDashboard leads={leads} />;
}
