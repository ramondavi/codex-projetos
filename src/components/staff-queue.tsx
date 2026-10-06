"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { QueueRequest, StaffOption } from "@/domain/staff-queue/types";
import { AppIcon } from "./app-icon";
import { RelativeDateTime } from "./relative-date-time";
import { PriorityBadge } from "./priority-badge";
import { RequestTimelineDialog } from "./request-timeline";
import { RequestPriorityControl } from "./request-priority-control";
import { formatWorkTitle } from "@/lib/work-title";

const statusLabels: Record<string, string> = { submitted: "Na fila", in_review: "Em análise", changes_requested: "Correções solicitadas", approved: "Homologada", completed: "Concluída", canceled: "Cancelada" };
const levelLabels: Record<string, string> = { undergraduate: "Graduação", specialization: "Especialização", master: "Mestrado", doctorate: "Doutorado" };
const timelineStages = ["Fila", "Análise", "Liberação", "Autodepósito", "Concluído"] as const;

export function StaffQueue({ initialRequests, staff, currentUserId, isAdministrator }: { initialRequests: QueueRequest[]; staff: StaffOption[]; currentUserId: string; isAdministrator: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const targetRequestId = params.get("solicitacao");
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [program, setProgram] = useState("");
  const [level, setLevel] = useState("");
  const [assignee, setAssignee] = useState(params.get("responsavel") === "me" ? "me" : "");
  const [age, setAge] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMineView = assignee === "me";
  const activeFilters = [status, program, level, age, assignee && assignee !== "me" ? assignee : ""].filter(Boolean).length;
  const waitingCount = requests.filter((item) => !item.assignedTo && !["completed", "canceled"].includes(item.status)).length;
  const mineCount = requests.filter((item) => item.assignedTo === currentUserId && !["completed", "canceled"].includes(item.status)).length;

  useEffect(() => { setRequests(initialRequests); }, [initialRequests]);
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("staff-queue-priorities")
      .on("postgres_changes", { event: "*", schema: "public", table: "request_priorities" }, () => router.refresh())
      .subscribe();
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    return () => { window.removeEventListener("focus", onFocus); void supabase.removeChannel(channel); };
  }, [router]);

  useEffect(() => {
    setAssignee(params.get("responsavel") === "me" ? "me" : "");
  }, [params]);
  useEffect(() => {
    if (!openActionsId) return;
    const closeOnOutside = (event: PointerEvent) => { if (!(event.target instanceof Element) || !event.target.closest("[data-queue-actions]")) setOpenActionsId(null); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenActionsId(null); };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOnOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, [openActionsId]);

  const programs = useMemo(() => Array.from(new Map(requests.map((item) => [item.programId, item.programName])).entries()), [requests]);
  const filtered = useMemo(() => requests.filter((item) => {
    if (targetRequestId) return item.id === targetRequestId;
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const searchable = `${item.studentName} ${item.registrationNumber ?? ""} ${item.protocol} ${item.title} ${item.subtitle ?? ""} ${item.advisorName}`.toLocaleLowerCase("pt-BR");
    const days = Math.floor((Date.now() - new Date(item.submittedAt).getTime()) / 86400000);
    return (item.status !== "completed" || status === "completed" || Boolean(query))
      && (!query || searchable.includes(query))
      && (!status || item.status === status)
      && (!program || item.programId === program)
      && (!level || item.level === level)
      && (!assignee || (assignee === "unassigned" ? !item.assignedTo : assignee === "me" ? item.assignedTo === currentUserId : item.assignedTo === assignee))
      && (!age || days >= Number(age));
  }).sort((a, b) => Number(b.isPriority) - Number(a.isPriority) || a.submittedAt.localeCompare(b.submittedAt)), [requests, search, status, program, level, assignee, age, currentUserId, targetRequestId]);

  useEffect(() => {
    if (!targetRequestId || !filtered.some((item) => item.id === targetRequestId)) return;
    const frame = window.requestAnimationFrame(() => document.getElementById(`queue-request-${targetRequestId}`)?.scrollIntoView({ block: "center" }));
    return () => window.cancelAnimationFrame(frame);
  }, [targetRequestId, filtered]);

  function runAction(name: "assume_cataloging_request" | "release_cataloging_request", requestId: string) {
    setError(undefined);
    startTransition(async () => {
      const supabase = createClient();
      const { error: actionError } = await supabase.rpc(name, { target_request_id: requestId });
      if (actionError) {
        setError(actionError.message.includes("request_already_assigned") ? "Outro bibliotecário assumiu este atendimento antes de você." : "Não foi possível atualizar o atendimento.");
        router.refresh();
        return;
      }
      setRequests((current) => current.map((item) => item.id === requestId ? { ...item, assignedTo: name.startsWith("assume") ? currentUserId : null, assigneeName: name.startsWith("assume") ? "Você" : null, status: name.startsWith("assume") ? "in_review" : "submitted", progressLabel: name.startsWith("assume") ? "Em análise bibliotecária" : "Aguardando responsável", progressTone: name.startsWith("assume") ? "active" : "waiting", progressStep: name.startsWith("assume") ? 1 : 0 } : item));
      setOpenActionsId(null);
      router.refresh();
    });
  }

  function reassign(requestId: string, targetStaffId: string) {
    if (!targetStaffId) return;
    setError(undefined);
    startTransition(async () => {
      const supabase = createClient();
      const { error: actionError } = await supabase.rpc("reassign_cataloging_request", { target_request_id: requestId, target_staff_id: targetStaffId });
      if (actionError) { setError("Não foi possível reatribuir o atendimento."); return; }
      const target = staff.find((item) => item.id === targetStaffId);
      setRequests((current) => current.map((item) => item.id === requestId ? { ...item, assignedTo: targetStaffId, assigneeName: target?.fullName ?? "Equipe", status: "in_review", progressLabel: "Em análise bibliotecária", progressTone: "active", progressStep: 1 } : item));
      setOpenActionsId(null);
      router.refresh();
    });
  }

  return <>
    <div className="page-heading queue-heading"><div className="queue-heading__intro"><h1><AppIcon className="panel-heading-icon" name={isMineView ? "work" : "queue"} />{isMineView ? "Meus atendimentos" : "Fila de solicitações"}</h1></div><div className="queue-heading__stats"><div><AppIcon name="inbox" /><span>Aguardando responsável</span><strong>{waitingCount}</strong></div><div><AppIcon name="work" /><span>Com você</span><strong>{mineCount}</strong></div></div></div>
    <nav className="queue-views" aria-label="Visões dos atendimentos"><Link href="/painel/fila" className={!isMineView ? "is-active" : ""} aria-current={!isMineView ? "page" : undefined}><AppIcon name="queue" />Fila geral</Link><Link href="/painel/fila?responsavel=me" className={isMineView ? "is-active" : ""} aria-current={isMineView ? "page" : undefined}><AppIcon name="work" />Meus atendimentos</Link></nav>
    {error && <div className="auth-feedback auth-feedback--error" role="alert">{error}</div>}
    {targetRequestId && <p className="queue-filters__notice"><AppIcon name="help" /><span>Protocolo aberto pelo aviso. <button className="text-button" type="button" onClick={() => router.replace("/painel/fila")}>Ver toda a fila</button></span></p>}
    <div className="queue-toolbar"><div className="queue-search"><label htmlFor="queue-search-input"><AppIcon name="search" />Buscar atendimento</label><div className="queue-search__field"><input id="queue-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Estudante, matrícula, protocolo, título ou orientador" /><button className="queue-more-filters" type="button" aria-expanded={filtersOpen} aria-controls="queue-extra-filters" onClick={() => setFiltersOpen((open) => !open)}><AppIcon name="settings" />Mais filtros{activeFilters > 0 && <span className="queue-filter-count">{activeFilters} {activeFilters === 1 ? "ativo" : "ativos"}</span>}<AppIcon className={`queue-more-filters__chevron${filtersOpen ? " is-open" : ""}`} name="arrowRight" /></button>{filtersOpen && <div className="queue-filters" id="queue-extra-filters" aria-label="Filtros da fila">
      <label>Status <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Programa <select value={program} onChange={(e) => setProgram(e.target.value)}><option value="">Todos</option>{programs.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label>Nível <select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Todos</option>{Object.entries(levelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Responsável <select value={assignee} onChange={(e) => setAssignee(e.target.value)}><option value="">Todos</option><option value="unassigned">Sem responsável</option><option value="me">Meus atendimentos</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label>
      <label>Tempo na fila <select value={age} onChange={(e) => setAge(e.target.value)}><option value="">Qualquer</option><option value="1">1 dia ou mais</option><option value="3">3 dias ou mais</option><option value="7">7 dias ou mais</option></select></label>
      <p className="queue-filters__notice"><AppIcon name="help" /><span>Concluídos ficam ocultos. Selecione <strong>Status: Concluída</strong> ou use a busca para encontrá-los.</span></p>
      {(activeFilters > 0 || search) && <button className="text-button queue-clear-filters" type="button" onClick={() => { setSearch(""); setStatus(""); setProgram(""); setLevel(""); setAge(""); setAssignee(isMineView ? "me" : ""); }}>Limpar filtros</button>}
    </div>}</div></div><span className="queue-count"><strong>{filtered.length}</strong><span>{filtered.length <= 1 ? "resultado" : "resultados"}</span></span></div>
    <section className="queue-list" aria-label="Solicitações">
      {filtered.map((item) => <article className={`queue-item queue-item--${item.progressTone}${item.id === targetRequestId ? " queue-item--target" : ""}`} id={`queue-request-${item.id}`} key={item.id}>
        <div className="queue-item__top"><div className="queue-item__identity"><span className="queue-item__protocol"><AppIcon name="document" />{item.protocol}</span>{item.isPriority && <PriorityBadge />}{item.hasInternalNote && <span className="queue-item__note"><AppIcon name="message" />Observação interna</span>}</div></div>
        <div className="queue-item__main"><h2>{formatWorkTitle(item.title, item.subtitle)}</h2><p className="queue-item__student"><span className="queue-item__student-detail"><AppIcon name="person" /><strong>Solicitante:</strong> {item.studentName}</span>{item.registrationNumber && <span className="queue-item__student-detail queue-item__registration"><AppIcon name="idCard" /><strong>Matrícula:</strong> {item.registrationNumber}</span>}</p><dl className="queue-item__facts"><div><dt><AppIcon name="book" />Programa</dt><dd title={item.programName}>{item.programLabel}</dd></div><div><dt><AppIcon name="document" />Tipo de monografia</dt><dd>{item.monographType}</dd></div><div><dt><AppIcon name="person" />Orientador</dt><dd>{item.advisorName || "Não informado"}</dd></div><div><dt><AppIcon name="calendar" />Enviada</dt><dd><RelativeDateTime value={item.submittedAt} /></dd></div></dl></div>
        <div className="queue-item__footer"><div className="queue-item__progress"><div className="queue-item__state" tabIndex={0} aria-label={`${item.progressLabel}. Passe o mouse ou use o teclado para ver as etapas.`}><span className={`progress-badge progress-badge--${item.progressTone}`}><AppIcon name={item.progressTone === "attention" ? "help" : item.progressTone === "done" ? "check" : "review"} />{item.progressLabel}</span><ol className="queue-item__timeline" aria-label={`Etapa atual: ${item.status === "canceled" ? "Cancelado" : timelineStages[item.progressStep]}`}>
          {(item.status === "canceled" ? ["Fila", "Cancelado"] : timelineStages).map((stage, index) => <li key={stage} className={index === item.progressStep ? "is-current" : index < item.progressStep ? "is-complete" : ""} aria-current={index === item.progressStep ? "step" : undefined}><span className="queue-item__timeline-dot" aria-hidden="true" />{stage}</li>)}
        </ol></div></div><div className="queue-item__actions"><span className="queue-item__assignee" title={item.assigneeName ?? "Sem responsável"}><AppIcon name="work" /><span>Bibliotecário: <strong>{item.assigneeName ?? "não atribuído"}</strong></span></span><div className={`queue-item__menu${openActionsId === item.id ? " is-open" : ""}`} data-queue-actions onKeyDown={(event) => { if (event.key === "Escape") { setOpenActionsId(null); event.currentTarget.querySelector<HTMLButtonElement>(".queue-item__menu-button")?.focus(); } }}><button className="queue-item__menu-button" type="button" aria-label={`Ações de ${item.protocol}`} title="Ações" aria-expanded={openActionsId === item.id} aria-controls={openActionsId === item.id ? `queue-actions-${item.id}` : undefined} onClick={() => setOpenActionsId((current) => current === item.id ? null : item.id)}><AppIcon name="settings" /></button>{openActionsId === item.id && <div className="queue-item__menu-panel" id={`queue-actions-${item.id}`}><strong>Outras ações</strong><RequestTimelineDialog requestId={item.id} menuItem />{item.assignedTo === currentUserId && item.canRevisitDeclarations && <Link href={`/painel/atendimento/${item.id}?rever=1${isMineView ? "&origem=meus" : ""}`}><AppIcon name="review" />Rever declarações</Link>}{!["completed", "canceled"].includes(item.status) && <RequestPriorityControl requestId={item.id} initialReasonCode={item.priorityReasonCode} initialReasonDetail={item.priorityReasonDetail} menuItem />}{item.assignedTo === currentUserId && <button type="button" disabled={pending} onClick={() => runAction("release_cataloging_request", item.id)}><AppIcon name="inbox" />Devolver à fila</button>}{isAdministrator && <label>Reatribuir atendimento<select aria-label={`Reatribuir ${item.protocol}`} defaultValue="" onChange={(event) => reassign(item.id, event.target.value)} disabled={pending}><option value="">Escolha um profissional</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label>}</div>}</div>{!item.assignedTo && <button className="button button--primary button--small button--with-icon" disabled={pending} onClick={() => runAction("assume_cataloging_request", item.id)}><AppIcon name="work" />Assumir atendimento</button>}{item.assignedTo === currentUserId && <Link className="button button--primary button--small button--with-icon" href={`/painel/atendimento/${item.id}${isMineView ? "?origem=meus" : ""}`}><AppIcon name="review" />Abrir análise</Link>}{item.assignedTo && item.assignedTo !== currentUserId && <Link className="button button--secondary button--small button--with-icon" href={`/painel/atendimento/${item.id}${isMineView ? "?origem=meus" : ""}`}><AppIcon name="search" />Visualizar</Link>}</div></div>
      </article>)}
      {filtered.length === 0 && <div className="history-empty"><div><p className="eyebrow">Fila</p><h2>{targetRequestId ? "Protocolo indisponível na fila" : "Nenhuma solicitação encontrada"}</h2></div><p>{targetRequestId ? "O protocolo pode ter sido removido ou seu acesso pode ter mudado." : "Altere os filtros ou aguarde a entrada de novos protocolos."}</p></div>}
    </section>
  </>;
}
