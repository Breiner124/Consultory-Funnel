import { NextResponse } from "next/server";

// Protege /admin con autenticación básica (usuario + clave por variables de entorno).
export function proxy(req) {
  const auth = req.headers.get("authorization");
  const USER = process.env.ADMIN_USER || "admin";
  const PASS = process.env.ADMIN_PASSWORD || "consultoria2025";

  if (auth) {
    try {
      const [, b64] = auth.split(" ");
      const [u, p] = atob(b64).split(":");
      if (u === USER && p === PASS) return NextResponse.next();
    } catch (_) {}
  }
  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Panel Admin"' },
  });
}

export const config = { matcher: ["/admin/:path*"] };
