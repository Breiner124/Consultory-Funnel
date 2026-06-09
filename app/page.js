"use client";

import { useEffect, useRef, useState } from "react";
import { isApproved } from "@/lib/scoring";

const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/message/QRI6VGAPURXNA1";

const QUESTIONS = [
  { id: "motivo", type: "textarea", num: "Pregunta 2 de 6",
    text: "¿Por qué quieres entrar a la comunidad?",
    hint: "Sé honesto. Queremos saber qué te mueve.",
    placeholder: "Escribe tu respuesta..." },
  { id: "ocupacion", type: "text", num: "Pregunta 3 de 6",
    text: "¿A qué te dedicas actualmente?",
    hint: "Tu ocupación o trabajo principal hoy.",
    placeholder: "Escribe tu respuesta..." },
  { id: "experiencia", type: "choice", num: "Pregunta 4 de 6",
    text: "¿Tienes experiencia en e-commerce o dropshipping?",
    options: ["Sí, ya tengo ventas", "Sí, pero sin resultados", "No, empiezo desde cero"] },
  { id: "horas", type: "choice", num: "Pregunta 5 de 6",
    text: "¿Cuántas horas reales puedes dedicar diariamente?",
    options: ["1-2 horas", "3-4 horas", "+5 horas"] },
  { id: "presupuesto", type: "choice", num: "Pregunta 6 de 6",
    text: "¿Con cuánto presupuesto cuentas para empezar este mes?",
    hint: "Sé realista. Esto define si podemos trabajar juntos.",
    options: ["Menos de 1 millón COP", "Entre 1 y 2 millones COP", "Entre 2 y 4 millones COP", "Más de 4 millones COP"] },
  { id: "telefono", type: "tel", num: "Último paso",
    text: "¿Cuál es tu número de WhatsApp?",
    hint: "Ahí te contactaremos para agendar tu sesión.",
    placeholder: "Ej. +57 300 123 4567" },
];

export default function Home() {
  const [screen, setScreen] = useState("hero"); // hero | 0..5 | ok | no
  const [answers, setAnswers] = useState({});
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  const total = QUESTIONS.length + 1;
  const stepIndex = typeof screen === "number" ? screen : screen === "hero" ? -1 : total;
  const progress = Math.min(100, ((stepIndex + 2) / (total + 1)) * 100);

  useEffect(() => {
    if (typeof screen === "number" && inputRef.current) {
      const t = setTimeout(() => inputRef.current.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const set = (id, val) => setAnswers((a) => ({ ...a, [id]: val }));

  const goNext = (i) => {
    if (i < QUESTIONS.length - 1) setScreen(i + 1);
    else submit();
  };

  async function submit() {
    setSending(true);
    const approved = isApproved(answers.presupuesto);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
    } catch (e) {
      console.warn("No se pudo guardar el lead:", e);
    }
    setSending(false);
    if (approved) {
      setScreen("ok");
      // Redirección en la MISMA pestaña: los navegadores no la bloquean
      // (window.open en segundo plano sí lo bloquean como pop-up).
      setTimeout(() => {
        try { window.location.href = WHATSAPP_URL; } catch (_) {}
      }, 1500);
    } else {
      setScreen("no");
    }
  }

  return (
    <main className="relative min-h-screen">
      {/* barra de progreso */}
      <div
        className="fixed top-0 left-0 h-1 z-50 transition-all duration-300"
        style={{ width: progress + "%", background: "linear-gradient(90deg,#3B82F6,#60A5FA)" }}
      />

      {/* HERO + Nombre */}
      {screen === "hero" && (
        <section className="rise mx-auto max-w-3xl px-6 min-h-screen flex flex-col justify-center py-24">
          <span className="inline-flex items-center gap-2 w-max mb-7 rounded-full border border-[#DBE7FF] bg-[#EFF5FF] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#1D4ED8]">
            <span className="pulse-dot h-[7px] w-[7px] rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,.18)]" />
            Consultoría E-commerce · Solo por aplicación
          </span>
          <h1 className="font-display font-extrabold tracking-tight leading-[1.08] text-[clamp(30px,5.4vw,52px)]">
            Esto es para gente que ejecuta:{" "}
            <span className="text-blue-500">aplica solo si vas en serio</span>{" "}
            (No nos hagas perder el tiempo).
          </h1>

          <div className="mt-10 rounded-[18px] border border-[#E7EBF0] bg-white p-6 shadow-[0_10px_40px_-12px_rgba(15,40,90,.18)]">
            <label className="block font-display font-bold text-lg mb-3.5">
              Empecemos. ¿Cuál es tu nombre y apellidos?
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Ej. Juan Pérez Gómez"
              value={answers.nombre || ""}
              onChange={(e) => set("nombre", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (answers.nombre || "").trim().length >= 2) setScreen(0); }}
              className="w-full rounded-[14px] border-[1.5px] border-[#E7EBF0] px-[18px] py-4 text-[17px] outline-none transition focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,.14)]"
            />
            <button
              disabled={(answers.nombre || "").trim().length < 2}
              onClick={() => setScreen(0)}
              className="mt-4 w-full rounded-[14px] bg-blue-500 px-6 py-[18px] font-display font-bold text-white shadow-[0_10px_24px_-8px_rgba(59,130,246,.6)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-[#C7D2E0] disabled:shadow-none"
            >
              Aplicar ahora →
            </button>
          </div>
        </section>
      )}

      {/* PASOS */}
      {typeof screen === "number" && (() => {
        const q = QUESTIONS[screen];
        const value = answers[q.id] || "";
        const isLast = screen === QUESTIONS.length - 1;
        const textValid = q.type === "tel"
          ? value.replace(/[^0-9]/g, "").length >= 7
          : value.trim().length > 0;

        return (
          <section key={q.id} className="rise mx-auto max-w-3xl px-6 min-h-screen flex flex-col justify-center py-24">
            <div className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-blue-500">
              <span className="opacity-70">↓</span> {q.num}
            </div>
            <div className="font-display font-bold text-[clamp(24px,3.6vw,34px)]">{q.text}</div>
            {q.hint ? <div className="mt-2 mb-7 text-[15px] text-ink-soft">{q.hint}</div> : <div className="h-3.5" />}

            {q.type === "choice" ? (
              <div className="flex flex-col gap-3">
                {q.options.map((o, i) => {
                  const sel = value === o;
                  return (
                    <button
                      key={o}
                      onClick={() => { set(q.id, o); setTimeout(() => goNext(screen), 240); }}
                      className={`flex items-center gap-3.5 rounded-[14px] border-[1.5px] px-[18px] py-4 text-left text-[16px] font-semibold transition ${
                        sel ? "border-blue-500 bg-[#EFF5FF] shadow-[0_0_0_3px_rgba(59,130,246,.12)]"
                            : "border-[#E7EBF0] bg-white hover:border-[#60A5FA] hover:bg-[#EFF5FF]"
                      }`}
                    >
                      <span className={`grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] border-[1.5px] font-display text-[13px] font-bold transition ${
                        sel ? "border-blue-500 bg-blue-500 text-white" : "border-[#E7EBF0] text-ink-soft"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {o}
                    </button>
                  );
                })}
              </div>
            ) : q.type === "textarea" ? (
              <textarea
                ref={inputRef}
                rows={5}
                placeholder={q.placeholder}
                value={value}
                onChange={(e) => set(q.id, e.target.value)}
                className="w-full resize-y rounded-[14px] border-[1.5px] border-[#E7EBF0] px-[18px] py-4 text-[17px] outline-none transition focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,.14)]"
              />
            ) : (
              <input
                ref={inputRef}
                type={q.type === "tel" ? "tel" : "text"}
                inputMode={q.type === "tel" ? "tel" : undefined}
                placeholder={q.placeholder}
                value={value}
                onChange={(e) => set(q.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && textValid) goNext(screen); }}
                className="w-full rounded-[14px] border-[1.5px] border-[#E7EBF0] px-[18px] py-4 text-[17px] outline-none transition focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,.14)]"
              />
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => setScreen(screen === 0 ? "hero" : screen - 1)}
                className="rounded-[14px] px-3.5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-[#F4F7FB] hover:text-ink"
              >
                ← Atrás
              </button>
              {q.type !== "choice" && (
                <button
                  disabled={!textValid || sending}
                  onClick={() => goNext(screen)}
                  className="rounded-[14px] bg-blue-500 px-6 py-4 font-display font-bold text-white shadow-[0_10px_24px_-8px_rgba(59,130,246,.6)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-[#C7D2E0] disabled:shadow-none"
                >
                  {sending ? "Enviando..." : isLast ? "Enviar aplicación ✓" : "Continuar →"}
                </button>
              )}
            </div>
          </section>
        );
      })()}

      {/* APROBADO */}
      {screen === "ok" && (
        <section className="rise mx-auto max-w-3xl px-6 min-h-screen flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#EFF5FF] text-4xl shadow-[0_0_0_10px_rgba(59,130,246,.07)]">🚀</div>
          <span className="inline-block rounded-full border border-[#BBF7D0] bg-[#ECFDF3] px-4 py-2 font-display text-xs font-extrabold uppercase tracking-[0.12em] text-[#16A34A]">✓ Estás pre-aprobado</span>
          <h2 className="mt-5 font-display text-[clamp(26px,4vw,40px)] font-extrabold">
            Felicidades, <span className="text-blue-500">{(answers.nombre || "crack").split(" ")[0]}</span>.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[17px] text-ink-soft">
            Tu perfil encaja con lo que buscamos. El siguiente paso es agendar tu sesión 1 a 1 por WhatsApp para revisar tu caso y definir el plan de escalado.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2.5 rounded-[14px] px-8 py-5 font-display text-lg font-bold text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,.6)] transition hover:brightness-95"
            style={{ background: "#25D366" }}
          >
            Agenda tu sesión aquí →
          </a>
          <p className="mt-5 text-[13px] text-ink-soft">Si no se abre automáticamente, toca el botón verde.</p>
        </section>
      )}

      {/* RECHAZADO */}
      {screen === "no" && (
        <section className="rise mx-auto max-w-3xl px-6 min-h-screen flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#F1F5F9] text-4xl shadow-[0_0_0_10px_rgba(100,116,139,.06)]">⏳</div>
          <h2 className="font-display text-[clamp(26px,4vw,40px)] font-extrabold">Por ahora no cumples con los requisitos</h2>
          <p className="mx-auto mt-3 max-w-lg text-[17px] text-ink-soft">
            No cumples con los requisitos para la consultoría 1 a 1 en este momento, pero mantente atento a nuestros recursos gratuitos.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-[17px] text-ink-soft">
            Cuando tengas el presupuesto listo para invertir y escalar, esta puerta sigue abierta.
          </p>
        </section>
      )}
    </main>
  );
}
