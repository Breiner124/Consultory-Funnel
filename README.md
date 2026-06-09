# Embudo de Aplicación — Consultoría E-commerce

Aplicación Next.js (App Router) lista para producción:
- Formulario tipo Typeform (una pregunta a la vez) con tu titular y filtro de presupuesto.
- Redirección automática a WhatsApp para los **pre-aprobados** (presupuesto ≥ 2M).
- Pantalla de espera para los que **no califican**.
- Panel privado `/admin` con tabla CRM, scoring por colores y exportación a CSV.
- Base de datos real (Neon Postgres) en producción; archivo local para pruebas.

---

## 1) Probar en tu computador (opcional)

Necesitas Node.js 18.18+ instalado.

```bash
npm install
cp .env.example .env.local   # ajusta ADMIN_USER y ADMIN_PASSWORD
npm run dev
```

Abre http://localhost:3000 (formulario) y http://localhost:3000/admin (panel).
Sin base de datos, los leads se guardan en `data/leads.json` solo para pruebas.

---

## 2) Subir a producción (Vercel + dominio propio)

### a) Sube el código a GitHub
1. Crea un repositorio nuevo en GitHub.
2. Sube esta carpeta (sin `node_modules`).

### b) Importa el proyecto en Vercel
1. Entra a https://vercel.com → **Add New → Project** → importa tu repo.
2. Vercel detecta Next.js automáticamente. Haz **Deploy**.

### c) Agrega la base de datos (Neon)
1. En tu proyecto de Vercel → pestaña **Storage** → **Create Database** → **Neon (Postgres)**.
2. Conéctala al proyecto. Vercel inyecta sola la variable `DATABASE_URL`.
   (No tienes que crear tablas: la app las crea automáticamente.)

### d) Configura las variables de entorno
En Vercel → **Settings → Environment Variables**, agrega:

| Variable | Valor |
|---|---|
| `ADMIN_USER` | el usuario que tú quieras (ej. `admin`) |
| `ADMIN_PASSWORD` | una clave fuerte para entrar a `/admin` |
| `NEXT_PUBLIC_WHATSAPP_URL` | `https://wa.me/message/QRI6VGAPURXNA1` |

Vuelve a desplegar (**Redeploy**) para que tomen efecto.

### e) Conecta tu dominio
En Vercel → **Settings → Domains** → agrega tu dominio (ej. `aplicar.tudominio.com`)
y sigue las instrucciones de DNS. Listo: ese es tu link, independiente de Claude.

---

## Cómo entrar al panel Admin
Ve a `https://tudominio.com/admin`. El navegador te pedirá usuario y clave
(los que pusiste en `ADMIN_USER` / `ADMIN_PASSWORD`).

## Lógica de scoring (panel Admin)
- 🔥 **Cliente Potencial Alto**: experiencia previa + 3h o más al día + presupuesto ≥ 2M.
- ⚠️ **Lead Medio**: con presupuesto ≥ 2M pero sin experiencia (o perfil por validar).
- ❄️ **Descartado**: presupuesto menor a 2M.

## Personalizar
- Titular y textos: `app/page.js`
- Preguntas y opciones: arreglo `QUESTIONS` en `app/page.js`
- Reglas de filtro/scoring: `lib/scoring.js`
- Enlace de WhatsApp: variable `NEXT_PUBLIC_WHATSAPP_URL`
