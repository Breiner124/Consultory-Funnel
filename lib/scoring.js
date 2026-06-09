// Criterios de cualificación y scoring

export const BUDGET_APPROVED = ["Entre 2 y 4 millones COP", "Más de 4 millones COP"];
export const BUDGET_MID_LOW  = ["Entre 1 y 2 millones COP"];
export const EXP_YES   = ["Sí, ya tengo ventas", "Sí, pero sin resultados"];
export const HOURS_HIGH = ["3-4 horas", "+5 horas"];

// Solo ≥ 2M van al WhatsApp (pre-aprobados)
export function isApproved(presupuesto) {
  return BUDGET_APPROVED.includes(presupuesto);
}

// Scoring para el panel Admin
export function scoreLead(l) {
  const budgetOK     = BUDGET_APPROVED.includes(l.presupuesto);
  const budgetMidLow = BUDGET_MID_LOW.includes(l.presupuesto);
  const hasExp  = EXP_YES.includes(l.experiencia);
  const hoursOK = HOURS_HIGH.includes(l.horas);

  // ❄️ Solo se descartan los de menos de 1 millón
  if (!budgetOK && !budgetMidLow)
    return { cls: "red",    label: "❄️ Descartado",         reason: "Presupuesto menor a 1 millón" };

  // 🧊 Entre 1 y 2 millones → Lead Medio-Bajo
  if (budgetMidLow)
    return { cls: "orange", label: "🧊 Lead Medio-Bajo",    reason: "Entre 1 y 2 millones COP" };

  // ≥ 2M con experiencia y horas
  if (hasExp && hoursOK)
    return { cls: "green",  label: "🔥 Cliente Potencial Alto", reason: "Experiencia + 3h o más + presupuesto ≥ 2M" };

  // ≥ 2M sin experiencia o pocas horas
  if (!hasExp)
    return { cls: "amber",  label: "⚠️ Lead Medio",         reason: "Sin experiencia pero con presupuesto" };

  return { cls: "amber",    label: "⚠️ Lead Medio",         reason: "Con presupuesto, perfil a validar" };
}
