"use client";

import { useState } from "react";
import { AppIcon } from "./app-icon";

type Announcement = { id: string; title: string; message: string; type: string; starts_at: string; ends_at: string | null };

const labels: Record<string, string> = { normal: "Aviso", recess: "Recesso", strike: "Paralisação/greve", other: "Ocorrência", holiday: "Feriado", optional_day: "Ponto facultativo" };
const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "America/Bahia" });
const fullDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Bahia" });
const dayParts = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/Bahia" });
const dayKey = (value: string | Date) => { const parts = Object.fromEntries(dayParts.formatToParts(new Date(value)).map((part) => [part.type, part.value])); return `${parts.year}-${parts.month}-${parts.day}`; };

export function StaffAnnouncementsCalendar({ announcements }: { announcements: Announcement[] }) {
  const today = dayKey(new Date());
  const [month, setMonth] = useState(() => new Date(`${today.slice(0, 7)}-01T12:00:00Z`));
  const [selected, setSelected] = useState(today);
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const hasAnnouncement = (date: string) => announcements.some((item) => dayKey(item.starts_at) <= date && date <= dayKey(item.ends_at ?? item.starts_at));
  const selectedItems = announcements.filter((item) => dayKey(item.starts_at) <= selected && selected <= dayKey(item.ends_at ?? item.starts_at));
  const changeMonth = (offset: number) => { const next = new Date(Date.UTC(year, monthIndex + offset, 1, 12)); setMonth(next); setSelected(dayKey(next)); };

  return <section className="staff-calendar" aria-label="Calendário de informes da biblioteca">
    <div className="staff-calendar__heading"><div><p className="eyebrow"><AppIcon name="calendar" /> Informes</p><h2>Calendário da biblioteca</h2></div></div>
    <div className="staff-calendar__month"><button type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior">‹</button><strong>{monthLabel.format(month)}</strong><button type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês">›</button></div>
    <div className="staff-calendar__grid" role="group" aria-label={monthLabel.format(month)}>{["D", "S", "T", "Q", "Q", "S", "S"].map((label, index) => <span className="staff-calendar__weekday" key={index}>{label}</span>)}{Array.from({ length: firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}{Array.from({ length: days }, (_, index) => { const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`; const marked = hasAnnouncement(date); return <button key={date} type="button" className={`${date === selected ? "is-selected " : ""}${date === today ? "is-today " : ""}${marked ? "has-announcement" : ""}`} aria-label={`${index + 1} de ${monthLabel.format(month)}${marked ? ", com informe" : ""}`} aria-pressed={date === selected} onClick={() => setSelected(date)}>{index + 1}</button>; })}</div>
    <div className="staff-calendar__events" aria-live="polite"><strong>{fullDate.format(new Date(`${selected}T12:00:00Z`))}</strong>{selectedItems.length ? selectedItems.map((item) => <article key={item.id}><span>{labels[item.type] ?? "Aviso"}</span><h3>{item.title}</h3><p>{item.message}</p></article>) : <p>Nenhum informe nesta data.</p>}</div>
  </section>;
}
