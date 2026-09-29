"use client";

import { useEffect, useState } from "react";

const fullDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" });

export function relativeDateTime(value: string, now: number) {
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((now - date.getTime()) / 60_000));
  const today = new Date(now);
  const dayNumber = (day: Date) => Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) / 86_400_000;
  const days = dayNumber(today) - dayNumber(date);
  if (days === 1) return "ontem";
  if (days > 1) return `há ${days} dias`;
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minuto" : "minutos"} atrás`;
  const hours = Math.floor(minutes / 60);
  return `${hours} ${hours === 1 ? "hora" : "horas"} atrás`;
}

export function RelativeDateTime({ value, className, focusable = true }: { value: string; className?: string; focusable?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const complete = fullDate.format(new Date(value));
  return <time className={`relative-datetime${className ? ` ${className}` : ""}`} dateTime={value} tabIndex={focusable ? 0 : undefined} aria-label={complete}>
    <span className="relative-datetime__relative">{now === null ? complete : relativeDateTime(value, now)}</span>
    <span className="relative-datetime__full" aria-hidden="true">{complete}</span>
  </time>;
}
