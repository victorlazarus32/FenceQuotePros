"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Lang = "en" | "es";

const COPY = {
  en: {
    title: "Approve this estimate",
    sub: "Sign below or click Accept to start scheduling.",
    signature: "Signature",
    print_name: "Print name",
    date: "Date",
    decline: "Decline",
    accept: "✓ Accept & schedule",
  },
  es: {
    title: "Aprobar este presupuesto",
    sub: "Firme abajo o haga clic en Aceptar para programar.",
    signature: "Firma",
    print_name: "Nombre",
    date: "Fecha",
    decline: "Rechazar",
    accept: "✓ Aceptar y programar",
  },
} as const;

export function AcceptDeclineBlock({
  acceptAction,
  declineAction,
  lang = "en",
}: {
  acceptAction: () => void | Promise<void>;
  declineAction: () => void | Promise<void>;
  lang?: Lang;
}) {
  const t = COPY[lang];
  const [signature, setSignature] = useState("");
  const today = new Date().toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="mt-8 rounded-md border-2 border-ink p-5"
      style={{ background: "var(--brand-soft)" }}
    >
      <div className="h-card text-ink">{t.title}</div>
      <div className="text-sm text-slate-600 mt-0.5">{t.sub}</div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_180px_140px] gap-4">
        <div>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-ink py-2 text-2xl outline-none focus:border-brand"
            style={{ fontFamily: "var(--font-script)" }}
            placeholder="x"
            aria-label={t.signature}
          />
          <div className="text-xs text-slate-600 mt-1">{t.signature}</div>
        </div>
        <div>
          <input
            type="text"
            className="w-full bg-transparent border-0 border-b-2 border-ink py-2 text-sm outline-none focus:border-brand"
            aria-label={t.print_name}
          />
          <div className="text-xs text-slate-600 mt-1">{t.print_name}</div>
        </div>
        <div>
          <div className="w-full border-b-2 border-ink py-2 text-sm text-slate-700">
            {today}
          </div>
          <div className="text-xs text-slate-600 mt-1">{t.date}</div>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2 no-print">
        <form action={declineAction} className="sm:flex-1">
          <Button variant="secondary" type="submit" className="w-full">
            {t.decline}
          </Button>
        </form>
        <form action={acceptAction} className="sm:flex-[2]">
          <Button type="submit" className="w-full">
            {t.accept}
          </Button>
        </form>
      </div>
    </div>
  );
}
