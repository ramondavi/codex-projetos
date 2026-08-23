export type TimelineEvent = { event_key?: string; key?: string; label: string; occurred_at: string };

export function RequestTimeline({ events }: { events: TimelineEvent[] }) {
  return <section className="panel protocol-timeline"><p className="eyebrow">Linha do tempo</p><h2>Histórico completo do protocolo</h2>{events.length === 0 ? <p>Nenhum evento registrado.</p> : <ol>{events.map((event) => <li key={`${event.event_key ?? event.key}-${event.occurred_at}`}><span aria-hidden="true" /><div><strong>{event.label}</strong><time dateTime={event.occurred_at}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date(event.occurred_at))}</time></div></li>)}</ol>}</section>;
}
