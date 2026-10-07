"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import { LiteraryAvatar } from "@/components/literary-avatar";
import { RelativeDateTime } from "@/components/relative-date-time";
import { createClient } from "@/lib/supabase/client";

export type StaffActivityEvent = {
  event_id: string;
  occurred_at: string;
  action: string;
  request_id: string;
  protocol: string;
  request_title: string;
  actor_id: string | null;
  actor_name: string;
  actor_role: string;
  avatar_choice: number | null;
};

const pageSize = 10;
const descriptions: Record<string, { verb: string; label: string; detail: string; icon: AppIconName; tone: string }> = {
  cataloging_request_assumed: { verb: "assumiu um atendimento", label: "Começou a análise", detail: "O protocolo saiu da fila e já tem responsável.", icon: "work", tone: "active" },
  cataloging_request_reassigned: { verb: "atribuiu um atendimento a outra pessoa", label: "Mudou de responsável", detail: "Outra pessoa da equipe dará continuidade ao protocolo.", icon: "person", tone: "active" },
  cataloging_request_released: { verb: "devolveu um atendimento à fila", label: "De volta à fila", detail: "O protocolo aguarda um novo responsável.", icon: "queue", tone: "pending" },
  request_changes_requested: { verb: "pediu ajustes em um trabalho", label: "Aguardando ajustes", detail: "O estudante recebeu orientações para corrigir os dados.", icon: "edit", tone: "pending" },
  request_corrections_submitted: { verb: "reenviou as correções", label: "Correções chegaram", detail: "O trabalho voltou para conferência da equipe.", icon: "review", tone: "active" },
  request_analysis_completed: { verb: "validou os metadados", label: "Análise avançou", detail: "Os metadados foram conferidos e o trabalho seguiu para catalogação.", icon: "check", tone: "done" },
  request_citation_validated: { verb: "validou a referência do trabalho", label: "Referência validada", detail: "A referência bibliográfica passou pela conferência da biblioteca.", icon: "book", tone: "done" },
  cataloging_card_homologated: { verb: "homologou a ficha catalográfica", label: "Ficha homologada", detail: "A ficha passou pela revisão técnica final.", icon: "document", tone: "done" },
  nada_consta_approved: { verb: "aprovou o Nada Consta", label: "Nada Consta aprovado", detail: "A documentação foi conferida e aprovada.", icon: "shield", tone: "done" },
  nada_consta_rejected: { verb: "solicitou um novo Nada Consta", label: "Novo documento solicitado", detail: "O estudante precisa reenviar a documentação.", icon: "shield", tone: "pending" },
  cataloging_request_completed: { verb: "concluiu um atendimento", label: "Atendimento concluído", detail: "A publicação no repositório foi verificada.", icon: "check", tone: "done" },
  request_priority_set: { verb: "sinalizou um protocolo como prioritário", label: "Prioridade definida", detail: "O protocolo recebeu prioridade operacional com justificativa registrada.", icon: "work", tone: "pending" },
  request_priority_removed: { verb: "retirou a prioridade de um protocolo", label: "Prioridade retirada", detail: "O protocolo voltou à ordem regular de atendimento.", icon: "queue", tone: "active" },
};

export function StaffActivityFeed({ initialEvents, userId, initialLoadError = false }: { initialEvents: StaffActivityEvent[]; userId: string; initialLoadError?: boolean }) {
  const [events, setEvents] = useState(initialEvents);
  const [hasMore, setHasMore] = useState(initialEvents.length === pageSize);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialLoadError);
  const [supabase] = useState(createClient);
  const postsRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const { data, error: requestError } = await supabase.rpc("list_staff_activity_feed", { page_size: pageSize });
    if (requestError) setError(true);
    else {
      const next = (data ?? []) as StaffActivityEvent[];
      setEvents((current) => [...new Map([...current, ...next].map((item) => [item.event_id, item])).values()].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at) || b.event_id.localeCompare(a.event_id)));
      setError(false);
    }
  }, [supabase]);

  useEffect(() => {
    void refresh();
    const channel = supabase.channel("staff-activity-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "staff_activity_events" }, () => { void refresh(); })
      .subscribe();
    const timer = window.setInterval(() => { void refresh(); }, 15000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); void supabase.removeChannel(channel); };
  }, [refresh, supabase]);

  const loadMore = useCallback(async () => {
    if (busy || !hasMore) return;
    const last = events.at(-1);
    if (!last) return;
    setBusy(true);
    const { data, error: requestError } = await supabase.rpc("list_staff_activity_feed", {
      page_size: pageSize, before_occurred_at: last.occurred_at, before_event_id: last.event_id,
    });
    if (requestError) setError(true);
    else { const next = (data ?? []) as StaffActivityEvent[]; setEvents((current) => [...new Map([...current, ...next].map((item) => [item.event_id, item])).values()]); setHasMore(next.length === pageSize); setError(false); }
    setBusy(false);
  }, [busy, hasMore, events, supabase]);

  useEffect(() => {
    if (!hasMore || busy || error || !postsRef.current || !endRef.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { observer.disconnect(); void loadMore(); } }, { root: postsRef.current, rootMargin: "0px 0px 80px 0px" });
    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, [hasMore, busy, error, events.length, loadMore]);

  return <section className="staff-feed" aria-label="Novidades dos atendimentos">
    {error && <p className="notice notice--error" role="alert">Não foi possível carregar as atualizações. Nova tentativa automática em instantes.</p>}
    {events.length ? <div className="staff-feed__posts" ref={postsRef}>{events.map((event) => {
      const description = descriptions[event.action];
      if (!description) return null;
      const staff = event.actor_role === "cataloger" || event.actor_role === "administrator";
      return <article className={`staff-feed__post staff-feed__post--${description.tone}`} key={event.event_id}>
        <div className="staff-feed__post-head"><div className="staff-feed__avatar">{staff && event.actor_id ? <LiteraryAvatar id={event.actor_id} label={event.actor_name} choice={event.avatar_choice} small /> : <span aria-hidden="true">{event.actor_name.charAt(0).toLocaleUpperCase("pt-BR")}</span>}</div><div className="staff-feed__byline"><p><strong>{event.actor_id === userId && staff ? "Você" : event.actor_name}</strong> {description.verb}</p><RelativeDateTime value={event.occurred_at} /></div></div>
        <div className="staff-feed__story"><span className="staff-feed__story-icon"><AppIcon name={description.icon} /></span><span className="staff-feed__story-label">{description.label}</span><h3>{event.request_title}</h3><span className="staff-feed__protocol">{event.protocol}</span></div>
        <div className="staff-feed__post-foot"><p>{description.detail}</p><Link href={`/painel/atendimento/${event.request_id}`}>Ver atendimento <AppIcon name="arrowRight" /></Link></div>
      </article>;
    })}{hasMore && <div ref={endRef} className="staff-feed__loading" role="status" aria-live="polite">{busy ? "Carregando novidades anteriores…" : ""}</div>}</div> : !error && <div className="staff-feed__empty"><AppIcon name="inbox" /><h3>Nenhuma novidade por enquanto</h3><p>As próximas ações da equipe nos atendimentos aparecerão neste feed.</p></div>}
  </section>;
}
