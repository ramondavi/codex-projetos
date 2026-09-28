"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { QueueRequest, StaffOption } from "@/domain/staff-queue/types";
import { AppIcon } from "./app-icon";
import { RelativeDateTime } from "./relative-date-time";
import { PriorityBadge } from "./priority-badge";

const statusLabels: Record<string, string> = { submitted: "Na fila", in_review: "Em análise", changes_requested: "Correções solicitadas", approved: "Homologada", completed: "Concluída", canceled: "Cancelada" };
const levelLabels: Record<string, string> = { undergraduate: "Graduação", specialization: "Especialização", master: "Mestrado", doctorate: "Doutorado" };

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

  const programs = useMemo(() => Array.from(new Map(requests.map((item) => [item.programId, item.programName])).entries()), [requests]);
  const filtered = useMemo(() => requests.filter((item) => {
    if (targetRequestId) return item.id === targetRequestId;
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const searchable = `${item.studentName} ${item.protocol} ${item.title} ${item.advisorName}`.toLocaleLowerCase("pt-BR");
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
      setRequests((current) => current.map((item) => item.id === requestId ? { ...item, assignedTo: name.startsWith("assume") ? currentUserId : null, assigneeName: name.startsWith("assume") ? "Você" : null, status: name.startsWith("assume") ? "in_review" : "submitted" } : item));
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
      setRequests((current) => current.map((item) => item.id === requestId ? { ...item, assignedTo: targetStaffId, assigneeName: target?.fullName ?? "Equipe", status: "in_review" } : item));
      router.refresh();
    });
  }

  return <>
    {error && <div className="auth-feedback auth-feedback--error" role="alert">{error}</div>}
    <section className="queue-filters" aria-label="Filtros da fila">
      {targetRequestId && <p className="queue-filters__notice"><AppIcon name="help" /><span>Exibindo o protocolo selecionado na notificação. Para usar os filtros, selecione <strong>Ver toda a fila</strong>.</span></p>}
      <label className="queue-search"><span><AppIcon name="search" />Busca</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Estudante, protocolo, título ou orientador" /></label>
      <label>Status <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Programa <select value={program} onChange={(e) => setProgram(e.target.value)}><option value="">Todos</option>{programs.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label>Nível <select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Todos</option>{Object.entries(levelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Responsável <select value={assignee} onChange={(e) => setAssignee(e.target.value)}><option value="">Todos</option><option value="unassigned">Sem responsável</option><option value="me">Meus atendimentos</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label>
      <label>Tempo na fila <select value={age} onChange={(e) => setAge(e.target.value)}><option value="">Qualquer</option><option value="1">1 dia ou mais</option><option value="3">3 dias ou mais</option><option value="7">7 dias ou mais</option></select></label>
      <p className="queue-filters__notice"><AppIcon name="help" /><span>Protocolos encerrados ficam ocultos por padrão. Para encontrá-los, selecione <strong>Status: Concluída</strong> ou use a busca por estudante, protocolo, título ou orientador.</span></p>
    </section>
    <div className="queue-count"><strong>{filtered.length}</strong> {filtered.length === 1 ? "solicitação encontrada" : "solicitações encontradas"}</div>
    {targetRequestId && <button className="text-button" type="button" onClick={() => router.replace("/painel/fila")}>Ver toda a fila</button>}
    <section className="queue-list" aria-label="Solicitações">
      {filtered.map((item) => <article className={`queue-item${item.id === targetRequestId ? " queue-item--target" : ""}`} id={`queue-request-${item.id}`} key={item.id}>
        <div className="queue-item__main"><div className="queue-item__meta"><span className={`status-badge status-badge--${item.status}`}>{statusLabels[item.status] ?? item.status}</span>{item.isPriority && <PriorityBadge />}<span className={`progress-badge progress-badge--${item.progressTone}`}>Agora: {item.progressLabel}</span><span>{item.protocol}</span><span>{levelLabels[item.level]}</span>{item.hasInternalNote && <span title="Há observação interna">● Observação interna</span>}</div><h2>{item.title}</h2><p>{item.studentName} · {item.programName}</p><small>Orientador: {item.advisorName || "Não informado"} · Enviada <RelativeDateTime value={item.submittedAt} /></small></div>
        <div className="queue-item__actions"><span>{item.assigneeName ? `Responsável: ${item.assigneeName}` : "Sem responsável"}</span>{!item.assignedTo && <button className="button button--primary button--small button--with-icon" disabled={pending} onClick={() => runAction("assume_cataloging_request", item.id)}><AppIcon name="work" />Assumir atendimento</button>}{item.assignedTo === currentUserId && <><Link className="button button--primary button--small button--with-icon" href={`/painel/atendimento/${item.id}`}><AppIcon name="review" />Abrir análise</Link><button className="text-button" disabled={pending} onClick={() => runAction("release_cataloging_request", item.id)}>Devolver à fila</button></>}{item.assignedTo && item.assignedTo !== currentUserId && <Link className="button button--secondary button--small button--with-icon" href={`/painel/atendimento/${item.id}`}><AppIcon name="search" />Visualizar</Link>}{isAdministrator && <select aria-label={`Reatribuir ${item.protocol}`} defaultValue="" onChange={(e) => reassign(item.id, e.target.value)} disabled={pending}><option value="">Reatribuir…</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select>}</div>
      </article>)}
      {filtered.length === 0 && <div className="history-empty"><div><p className="eyebrow">Fila</p><h2>{targetRequestId ? "Protocolo indisponível na fila" : "Nenhuma solicitação encontrada"}</h2></div><p>{targetRequestId ? "O protocolo pode ter sido removido ou seu acesso pode ter mudado." : "Altere os filtros ou aguarde a entrada de novos protocolos."}</p></div>}
    </section>
  </>;
}
