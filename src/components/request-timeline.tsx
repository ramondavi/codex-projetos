"use client";

import { useRef } from "react";
import { AppIcon } from "./app-icon";

export type TimelineEvent = { event_key?: string; key?: string; label: string; occurred_at: string };

export function RequestTimeline({ events, showHeading = true, highlightCurrent = false }: { events: TimelineEvent[]; showHeading?: boolean; highlightCurrent?: boolean }) {
  const currentEvent = events.reduce<TimelineEvent | null>((latest, event) => !latest || new Date(event.occurred_at).getTime() >= new Date(latest.occurred_at).getTime() ? event : latest, null);
  return <section className="panel protocol-timeline">{showHeading && <><p className="eyebrow">Linha do tempo</p><h2>Histórico completo do protocolo</h2></>}{events.length === 0 ? <p>Nenhum evento registrado.</p> : <ol>{events.map((event) => <li className={highlightCurrent && event === currentEvent ? "protocol-timeline__current" : ""} key={`${event.event_key ?? event.key}-${event.occurred_at}`}><span aria-hidden="true" /><div><strong>{event.label}</strong>{highlightCurrent && event === currentEvent && <small>Estado atual do atendimento</small>}<time dateTime={event.occurred_at}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date(event.occurred_at))}</time></div></li>)}</ol>}</section>;
}

export function RequestTimelineDialog({ events }: { events: TimelineEvent[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return <><button className="button button--secondary button--small button--with-icon" type="button" onClick={() => dialogRef.current?.showModal()}><AppIcon name="calendar" />Ver histórico do atendimento</button><dialog className="timeline-dialog" ref={dialogRef} aria-label="Histórico do atendimento"><div className="timeline-dialog__header"><div><p className="eyebrow">Histórico do atendimento</p><h2>Marcos do protocolo</h2></div><button className="text-button" type="button" onClick={() => dialogRef.current?.close()}>Fechar</button></div><RequestTimeline events={events} showHeading={false} highlightCurrent /></dialog></>;
}
