"use client";

import { useEffect, useState } from "react";

type Closure = { type: string; starts_at: string; ends_at: string | null };
const dateLabel = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });
const dayKey = (date: Date) => date.toISOString().slice(0, 10);

function isBusinessDay(date: Date, closures: Closure[]) {
  const weekday = date.getUTCDay();
  const day = dayKey(date);
  return weekday !== 0 && weekday !== 6 && !closures.some((item) => {
    const start = item.starts_at.slice(0, 10);
    const end = item.ends_at?.slice(0, 10) ?? (["holiday", "optional_day"].includes(item.type) ? start : null);
    return day >= start && (end === null || day <= end);
  });
}

function dueDate(submittedAt: string, businessDays: number, closures: Closure[]) {
  const date = new Date(submittedAt);
  if (Number.isNaN(date.getTime())) return null;
  let remaining = Math.max(1, businessDays);
  for (let scanned = 0; scanned < 366 && remaining > 0; scanned++) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (isBusinessDay(date, closures)) remaining--;
  }
  return remaining === 0 ? date : null;
}

function remainingBusinessDays(now: Date, due: Date, closures: Closure[]) {
  if (now >= due) return 0;
  const cursor = new Date(now);
  let remaining = 0;
  while (cursor < due) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    if (cursor <= due && isBusinessDay(cursor, closures)) remaining++;
  }
  return remaining;
}

export function RequestSlaEstimate({ submittedAt, businessDays, closures, status }: { submittedAt: string; businessDays: number | null; closures: Closure[] | null; status: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  if (status === "completed") return <strong>Protocolo concluído</strong>;
  if (status === "canceled") return <strong>Protocolo cancelado</strong>;
  if (status === "approved") return <strong>Análise da biblioteca concluída</strong>;
  if (businessDays === null || closures === null) return <strong>Previsão temporariamente indisponível</strong>;
  const due = dueDate(submittedAt, businessDays, closures);
  if (!due) return <strong>Previsão indisponível: há uma suspensão sem data de término</strong>;
  const date = dateLabel.format(due);
  if (now === null) return <strong>Até {date} · {businessDays} dias úteis a partir do envio</strong>;
  const remaining = remainingBusinessDays(new Date(now), due, closures);
  if (now >= due.getTime()) return <strong>Prazo de referência ultrapassado · previsão inicial: {date}</strong>;
  return <strong>{remaining === 0 ? "Menos de 1 dia útil" : `${remaining} ${remaining === 1 ? "dia útil restante" : "dias úteis restantes"}`} · previsão: {date}</strong>;
}
