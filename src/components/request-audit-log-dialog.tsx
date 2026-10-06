"use client";

import { useRef, useState } from "react";
import { AppIcon, type AppIconName } from "./app-icon";
import { ModalCloseButton } from "./modal-close-button";
import { createClient } from "@/lib/supabase/client";

type AuditEvent = { event_id: string; occurred_at: string; action: string; actor_name: string; actor_role: string };
const pageSize = 20;
const fullDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bahia" });
const actions: Record<string, { label: string; icon: AppIconName }> = {
  cataloging_request_assumed: { label: "Assumiu o atendimento", icon: "work" },
  cataloging_request_reassigned: { label: "Atribuiu ou mudou o responsável técnico", icon: "person" },
  cataloging_request_released: { label: "Devolveu o atendimento à fila", icon: "queue" },
  request_changes_requested: { label: "Solicitou correções ao estudante", icon: "edit" },
  request_corrections_submitted: { label: "Reenviou as correções", icon: "upload" },
  request_analysis_completed: { label: "Validou os metadados", icon: "check" },
  request_field_corrected_by_staff: { label: "Corrigiu um campo na análise", icon: "edit" },
  request_direct_corrections_reset: { label: "Restaurou correções da análise", icon: "review" },
  request_direct_correction_restored: { label: "Restaurou um campo corrigido", icon: "review" },
  request_citation_validated: { label: "Validou a referência bibliográfica", icon: "book" },
  cataloging_card_homologated: { label: "Homologou a ficha catalográfica", icon: "document" },
  nada_consta_uploaded: { label: "Enviou o Nada Consta", icon: "upload" },
  nada_consta_approved: { label: "Aprovou o Nada Consta", icon: "shield" },
  nada_consta_rejected: { label: "Devolveu o Nada Consta", icon: "shield" },
  repository_deposit_started: { label: "Iniciou o autodepósito", icon: "external" },
  repository_publication_verified: { label: "Verificou a publicação no repositório", icon: "check" },
  cataloging_request_completed: { label: "Encerrou o protocolo", icon: "check" },
  request_canceled_failed_declaration: { label: "Cancelou o protocolo após conferência das declarações", icon: "close" },
  request_priority_set: { label: "Marcou o protocolo como prioritário", icon: "star" },
  request_priority_removed: { label: "Retirou a prioridade", icon: "star" },
  public_work_link_checked: { label: "Conferiu o link público do trabalho", icon: "link" },
  card_equivalent_title_decided: { label: "Definiu o uso do título equivalente na ficha", icon: "document" },
  author_birth_year_validation_revoked: { label: "Revogou a validação do ano de nascimento", icon: "person" },
  coordination_magic_link_issued: { label: "Emitiu o acesso da coordenação", icon: "link" },
  coordination_magic_link_invalidated: { label: "Invalidou o acesso da coordenação", icon: "lock" },
};

export function RequestAuditLogDialog({ requestId }: { requestId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"unavailable" | "failed" | null>(null);

  async function load(older: boolean) {
    if (busy) return;
    setBusy(true);
    setError(null);
    const last = older ? events.at(-1) : undefined;
    const { data, error: loadError } = await createClient().rpc("list_request_staff_audit_log", {
      target_request_id: requestId,
      page_size: pageSize,
      before_occurred_at: last?.occurred_at ?? null,
      before_event_id: last?.event_id ?? null,
    });
    if (loadError) setError(loadError.code === "PGRST202" || loadError.code === "42883" ? "unavailable" : "failed");
    else {
      const page = (data ?? []) as AuditEvent[];
      setEvents((current) => older ? [...current, ...page] : page);
      setHasMore(page.length === pageSize);
    }
    setBusy(false);
  }

  function open() {
    dialogRef.current?.showModal();
    setEvents([]);
    setHasMore(false);
    void load(false);
  }

  return <><button className="protocol-actions-menu__item" type="button" onClick={open}><AppIcon name="archive" />Ver registro de ações</button><dialog className="request-audit-dialog pronto-modal" ref={dialogRef} aria-label="Registro de ações do atendimento"><div className="timeline-dialog__header"><span className="timeline-dialog__icon" aria-hidden="true"><AppIcon name="archive" /></span><div><p className="eyebrow">Uso interno da equipe</p><h2>Registro de ações</h2></div><ModalCloseButton onClick={() => dialogRef.current?.close()} /></div><p className="request-audit-dialog__intro">Quem fez cada ação e quando. Os detalhes sensíveis não são exibidos aqui.</p>{error && <p className="auth-feedback auth-feedback--error" role="alert">{error === "unavailable" ? "O registro ainda não está disponível neste ambiente. A atualização do banco precisa ser aplicada." : <>Não foi possível carregar o registro. <button type="button" className="text-button" onClick={() => void load(events.length > 0)}>Tentar novamente</button></>}</p>}{busy && events.length === 0 && <p className="request-audit-dialog__empty" role="status">Carregando ações…</p>}{!busy && !error && events.length === 0 && <p className="request-audit-dialog__empty">Nenhuma ação registrada para este atendimento.</p>}{events.length > 0 && <ol className="request-audit-dialog__list">{events.map((event) => { const description = actions[event.action]; return <li key={event.event_id}><span className="request-audit-dialog__event-icon" aria-hidden="true"><AppIcon name={description?.icon ?? "review"} /></span><div><strong>{description?.label ?? "Ação registrada"}</strong><span>{event.actor_name}</span></div><time dateTime={event.occurred_at}>{fullDate.format(new Date(event.occurred_at))}</time></li>; })}</ol>}{hasMore && <button className="button button--secondary button--small request-audit-dialog__more" type="button" disabled={busy} onClick={() => void load(true)}>{busy ? "Carregando…" : "Carregar ações anteriores"}</button>}</dialog></>;
}
