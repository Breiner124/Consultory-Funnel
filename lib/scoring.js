// Lógica de cualificación y scoring (compartida por API y Admin)

export const BUDGET_HIGH = ["Entre 2 y 4 millones COP", "Más de 4 millones COP"];
export const EXP_YES = ["Sí, ya tengo ventas", "Sí, pero sin resultados"];
export const HOURS_HIGH = ["3-4 horas", "+5 horas"];

// Aprobado = presupuesto de 2M en adelante -> va a WhatsApp
export function isApproved(presupuesto) {
  return BUDGET_HIGH.includes(presupuesto);
}

// Etiqueta de scoring para el panel Admin
export function scoreLead(l) {
  const budgetOK = BUDGET_HIGH.includes(l.presupuesto);
  const hasExp = EXP_YES.includes(l.experiencia);
  const hoursOK = HOURS_HIGH.includes(l.horas);

  if (!budgetOK)
    return { cls: "red", label: "❄️ Descartado", reason: "Presupuesto menor a 2 millones" };
  if (hasExp && hoursOK)
    return { cls: "green", label: "🔥 Cliente Potencial Alto", reason: "Experiencia + 3h o más + presupuesto" };
  if (!hasExp)
    return { cls: "amber", label: "⚠️ Lead Medio", reason: "Sin experiencia pero con presupuesto" };
  return { cls: "amber", label: "⚠️ Lead Medio", reason: "Con presupuesto, perfil a validar" };
}
