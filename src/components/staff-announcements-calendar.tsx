"use client";

import { useEffect, useRef, useState } from "react";
import { AppIcon } from "./app-icon";

type Announcement = { id: string; title: string; message: string; type: string; starts_at: string; ends_at: string | null };

const labels: Record<string, string> = { normal: "Aviso", recess: "Recesso", strike: "Paralisação/greve", other: "Ocorrência", holiday: "Feriado", optional_day: "Ponto facultativo" };
const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "America/Bahia" });
const fullDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Bahia" });
const dayParts = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/Bahia" });
const dayKey = (value: string | Date) => { const parts = Object.fromEntries(dayParts.formatToParts(new Date(value)).map((part) => [part.type, part.value])); return `${parts.year}-${parts.month}-${parts.day}`; };
const ongoingTypes = new Set(["recess", "strike"]);
const closureTypes = new Set(["recess", "strike", "holiday", "optional_day"]);
const appliesOn = (item: Announcement, date: string) => dayKey(item.starts_at) <= date && (item.ends_at ? date <= dayKey(item.ends_at) : ongoingTypes.has(item.type) || date === dayKey(item.starts_at));
const closesLibrary = (item: Announcement) => closureTypes.has(item.type) || item.type === "other" && /biblioteca (sem funcionamento|fechada)/i.test(`${item.title} ${item.message}`);
const isWeekend = (date: string) => [0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay());

export function StaffAnnouncementsCalendar({ announcements }: { announcements: Announcement[] }) {
  const today = dayKey(new Date());
  const [month, setMonth] = useState(() => new Date(`${today.slice(0, 7)}-01T12:00:00Z`));
  const [selected, setSelected] = useState<string | null>(today);
  const [eventsOpen, setEventsOpen] = useState(false);
  const selectedDayRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const monthTitle = monthLabel.format(month).replace(/^./, (letter) => letter.toLocaleUpperCase("pt-BR"));
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const hasAnnouncement = (date: string) => announcements.some((item) => appliesOn(item, date));
  const isClosedOn = (date: string) => isWeekend(date) || announcements.some((item) => appliesOn(item, date) && closesLibrary(item));
  const selectedItems = selected ? announcements.filter((item) => appliesOn(item, selected)) : [];
  const selectedClosed = selected ? isClosedOn(selected) : false;
  const changeMonth = (offset: number) => { const next = new Date(Date.UTC(year, monthIndex + offset, 1, 12)); setMonth(next); setSelected(dayKey(next).slice(0, 7) === today.slice(0, 7) ? today : null); setEventsOpen(false); };
  const closeEvents = () => { setEventsOpen(false); requestAnimationFrame(() => selectedDayRef.current?.focus()); };
  useEffect(() => { if (eventsOpen) closeRef.current?.focus(); }, [eventsOpen]);

  return <section className="staff-calendar" aria-label="Informes e funcionamento da biblioteca" onKeyDown={(event) => { if (event.key === "Escape" && eventsOpen) closeEvents(); }}>
    <div className="staff-calendar__heading"><h2><AppIcon name="calendar" />Informes e funcionamento</h2><span className="staff-calendar__legend"><i aria-hidden="true" />Biblioteca fechada</span></div>
    <div className="staff-calendar__month"><button type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><AppIcon className="staff-calendar__previous" name="arrowRight" /></button><strong>{monthTitle}</strong><button type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês"><AppIcon name="arrowRight" /></button></div>
    <div className="staff-calendar__grid" role="group" aria-label={monthTitle}>{["D", "S", "T", "Q", "Q", "S", "S"].map((label, index) => <span className="staff-calendar__weekday" key={index}>{label}</span>)}{Array.from({ length: firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}{Array.from({ length: days }, (_, index) => { const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`; const marked = hasAnnouncement(date); const closed = isClosedOn(date); return <button ref={date === selected ? selectedDayRef : undefined} key={date} type="button" className={`${date === selected ? "is-selected " : ""}${date === today ? "is-today " : ""}${marked ? "has-announcement " : ""}${closed ? "is-closed" : ""}`} aria-label={`${index + 1} de ${monthLabel.format(month)}${closed ? ", biblioteca fechada" : ""}${marked ? ", com informe" : ""}`} aria-pressed={date === selected} onClick={() => { setSelected(date); setEventsOpen(marked || closed); }}>{index + 1}</button>; })}</div>
    {eventsOpen && (selectedItems.length > 0 || selectedClosed) && <div className="staff-calendar__event-overlay" onClick={(event) => { if (event.target === event.currentTarget) closeEvents(); }}><div className="staff-calendar__event-modal" role="dialog" aria-modal="true" aria-label={`Informes de ${fullDate.format(new Date(`${selected}T12:00:00Z`))}`}><div className="staff-calendar__event-modal-heading"><strong>{fullDate.format(new Date(`${selected}T12:00:00Z`))}</strong><button ref={closeRef} type="button" onClick={closeEvents} aria-label="Fechar informes">×</button></div>{selectedClosed && <p className="staff-calendar__closure"><AppIcon name="lock" />Biblioteca fechada neste dia.</p>}{selectedItems.length > 0 && <div className="staff-calendar__events">{selectedItems.map((item) => <article key={item.id}><span>{labels[item.type] ?? "Aviso"}</span><h3>{item.title}</h3><p>{item.message}</p></article>)}</div>}</div></div>}
  </section>;
}
