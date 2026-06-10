// Capa de almacenamiento.
// - Producción (Vercel): usa Neon Postgres si hay DATABASE_URL / POSTGRES_URL.
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
      aprobado BOOLEAN,
      estado TEXT DEFAULT 'nuevo'
    )`;
    // Por si la tabla ya existía sin la columna estado:
    await _sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'nuevo'`;
    pgReady = true;
  }
  return _sql;
}

export async function saveLead(lead) {
  if (usePostgres) {
    const sql = await getSql();
    await sql`INSERT INTO leads
      (id, nombre, motivo, ocupacion, experiencia, horas, presupuesto, telefono, aprobado, estado)
      VALUES (${lead.id}, ${lead.nombre}, ${lead.motivo}, ${lead.ocupacion},
              ${lead.experiencia}, ${lead.horas}, ${lead.presupuesto},
              ${lead.telefono}, ${lead.aprobado}, 'nuevo')`;
    return;
  }
  await ensureFile();
  const arr = JSON.parse((await fs.readFile(DATA_FILE, "utf8")) || "[]");
  arr.push({ ...lead, estado: "nuevo" });
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
      estado: r.estado || "nuevo",
    }));
  }
  await ensureFile();
  const arr = JSON.parse((await fs.readFile(DATA_FILE, "utf8")) || "[]");
  return arr
    .map((l) => ({ ...l, estado: l.estado || "nuevo" }))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export async function deleteLead(id) {
  if (usePostgres) {
    const sql = await getSql();
    await sql`DELETE FROM leads WHERE id = ${id}`;
    return;
  }
  await ensureFile();
  const arr = JSON.parse((await fs.readFile(DATA_FILE, "utf8")) || "[]");
  await fs.writeFile(DATA_FILE, JSON.stringify(arr.filter((l) => l.id !== id), null, 2), "utf8");
}

export async function updateEstado(id, estado) {
  if (usePostgres) {
    const sql = await getSql();
    await sql`UPDATE leads SET estado = ${estado} WHERE id = ${id}`;
    return;
  }
  await ensureFile();
  const arr = JSON.parse((await fs.readFile(DATA_FILE, "utf8")) || "[]");
  const next = arr.map((l) => (l.id === id ? { ...l, estado } : l));
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), "utf8");
}

// Cuenta total de leads (para la prueba social del formulario)
export async function countLeads() {
  if (usePostgres) {
    const sql = await getSql();
    const rows = await sql`SELECT COUNT(*)::int AS n FROM leads`;
    return rows[0]?.n || 0;
  }
  await ensureFile();
  const arr = JSON.parse((await fs.readFile(DATA_FILE, "utf8")) || "[]");
  return arr.length;
}
