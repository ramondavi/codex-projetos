"use client";

import { useEffect, useRef, useState } from "react";
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
  const [eventsOpen, setEventsOpen] = useState(false);
  const selectedDayRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const monthTitle = monthLabel.format(month).replace(/^./, (letter) => letter.toLocaleUpperCase("pt-BR"));
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const hasAnnouncement = (date: string) => announcements.some((item) => dayKey(item.starts_at) <= date && date <= dayKey(item.ends_at ?? item.starts_at));
  const selectedItems = announcements.filter((item) => dayKey(item.starts_at) <= selected && selected <= dayKey(item.ends_at ?? item.starts_at));
  const changeMonth = (offset: number) => { const next = new Date(Date.UTC(year, monthIndex + offset, 1, 12)); setMonth(next); setSelected(dayKey(next)); setEventsOpen(false); };
  const closeEvents = () => { setEventsOpen(false); requestAnimationFrame(() => selectedDayRef.current?.focus()); };
  useEffect(() => { if (eventsOpen) closeRef.current?.focus(); }, [eventsOpen]);

  return <section className="staff-calendar" aria-label="Calendário de informes da biblioteca" onKeyDown={(event) => { if (event.key === "Escape" && eventsOpen) closeEvents(); }}>
    <div className="staff-calendar__heading"><h2><AppIcon name="calendar" />Informes</h2></div>
    <div className="staff-calendar__month"><button type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior">‹</button><strong>{monthTitle}</strong><button type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês">›</button></div>
    <div className="staff-calendar__grid" role="group" aria-label={monthTitle}>{["D", "S", "T", "Q", "Q", "S", "S"].map((label, index) => <span className="staff-calendar__weekday" key={index}>{label}</span>)}{Array.from({ length: firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}{Array.from({ length: days }, (_, index) => { const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`; const marked = hasAnnouncement(date); return <button ref={date === selected ? selectedDayRef : undefined} key={date} type="button" className={`${date === selected ? "is-selected " : ""}${date === today ? "is-today " : ""}${marked ? "has-announcement" : ""}`} aria-label={`${index + 1} de ${monthLabel.format(month)}${marked ? ", com informe" : ""}`} aria-pressed={date === selected} onClick={() => { setSelected(date); setEventsOpen(marked); }}>{index + 1}</button>; })}</div>
    {eventsOpen && selectedItems.length > 0 && <div className="staff-calendar__event-overlay" onClick={(event) => { if (event.target === event.currentTarget) closeEvents(); }}><div className="staff-calendar__event-modal" role="dialog" aria-modal="true" aria-label={`Informes de ${fullDate.format(new Date(`${selected}T12:00:00Z`))}`}><div className="staff-calendar__event-modal-heading"><strong>{fullDate.format(new Date(`${selected}T12:00:00Z`))}</strong><button ref={closeRef} type="button" onClick={closeEvents} aria-label="Fechar informes">×</button></div><div className="staff-calendar__events">{selectedItems.map((item) => <article key={item.id}><span>{labels[item.type] ?? "Aviso"}</span><h3>{item.title}</h3><p>{item.message}</p></article>)}</div></div></div>}
  </section>;
}
