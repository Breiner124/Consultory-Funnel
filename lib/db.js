// Capa de almacenamiento.
// - Producción (Vercel): usa Neon Postgres si hay DATABASE_URL / POSTGRES_URL.
//   (Al agregar la integración de Neon en Vercel, estas variables se crean solas.)
// - Local (sin base de datos): guarda en data/leads.json para poder probar.
import fs from "fs/promises";
import path from "path";

const CONN = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
const usePostgres = !!CONN;
const DATA_FILE = path.join(process.cwd(), "data", "leads.json");

async function ensureFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

let _sql = null;
let pgReady = false;
async function getSql() {
  if (!_sql) {
    const { neon } = await import("@neondatabase/serverless");
    _sql = neon(CONN);
  }
  if (!pgReady) {
    await _sql`CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT now(),
      nombre TEXT,
      motivo TEXT,
      ocupacion TEXT,
      experiencia TEXT,
      horas TEXT,
      presupuesto TEXT,
      telefono TEXT,
      aprobado BOOLEAN
    )`;
    pgReady = true;
  }
  return _sql;
}

export async function saveLead(lead) {
  if (usePostgres) {
    const sql = await getSql();
    await sql`INSERT INTO leads
      (id, nombre, motivo, ocupacion, experiencia, horas, presupuesto, telefono, aprobado)
      VALUES (${lead.id}, ${lead.nombre}, ${lead.motivo}, ${lead.ocupacion},
              ${lead.experiencia}, ${lead.horas}, ${lead.presupuesto},
              ${lead.telefono}, ${lead.aprobado})`;
    return;
  }
  await ensureFile();
  const arr = JSON.parse((await fs.readFile(DATA_FILE, "utf8")) || "[]");
  arr.push(lead);
  await fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), "utf8");
}

export async function getLeads() {
  if (usePostgres) {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
    return rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      nombre: r.nombre,
      motivo: r.motivo,
      ocupacion: r.ocupacion,
      experiencia: r.experiencia,
      horas: r.horas,
      presupuesto: r.presupuesto,
      telefono: r.telefono,
      aprobado: r.aprobado,
    }));
  }
  await ensureFile();
  const arr = JSON.parse((await fs.readFile(DATA_FILE, "utf8")) || "[]");
  return arr.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
