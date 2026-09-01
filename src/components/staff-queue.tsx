"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { QueueRequest, StaffOption } from "@/domain/staff-queue/types";

const statusLabels: Record<string, string> = { submitted: "Na fila", in_review: "Em análise", changes_requested: "Correções solicitadas", approved: "Homologada", completed: "Concluída", canceled: "Cancelada" };
const levelLabels: Record<string, string> = { undergraduate: "Graduação", specialization: "Especialização", master: "Mestrado", doctorate: "Doutorado" };

export function StaffQueue({ initialRequests, staff, currentUserId, isAdministrator }: { initialRequests: QueueRequest[]; staff: StaffOption[]; currentUserId: string; isAdministrator: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [program, setProgram] = useState("");
  const [level, setLevel] = useState("");
  const [assignee, setAssignee] = useState(params.get("responsavel") === "me" ? "me" : "");
  const [age, setAge] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setAssignee(params.get("responsavel") === "me" ? "me" : "");
  }, [params]);

  const programs = useMemo(() => Array.from(new Map(requests.map((item) => [item.programId, item.programName])).entries()), [requests]);
  const filtered = useMemo(() => requests.filter((item) => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const searchable = `${item.studentName} ${item.protocol} ${item.title} ${item.advisorName}`.toLocaleLowerCase("pt-BR");
    const days = Math.floor((Date.now() - new Date(item.submittedAt).getTime()) / 86400000);
    return (!query || searchable.includes(query))
      && (!status || item.status === status)
      && (!program || item.programId === program)
      && (!level || item.level === level)
      && (!assignee || (assignee === "unassigned" ? !item.assignedTo : assignee === "me" ? item.assignedTo === currentUserId : item.assignedTo === assignee))
      && (!age || days >= Number(age));
  }), [requests, search, status, program, level, assignee, age, currentUserId]);

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
      <label className="queue-search">Busca <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Estudante, protocolo, título ou orientador" /></label>
      <label>Status <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Programa <select value={program} onChange={(e) => setProgram(e.target.value)}><option value="">Todos</option>{programs.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label>Nível <select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Todos</option>{Object.entries(levelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Responsável <select value={assignee} onChange={(e) => setAssignee(e.target.value)}><option value="">Todos</option><option value="unassigned">Sem responsável</option><option value="me">Meus atendimentos</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label>
      <label>Tempo na fila <select value={age} onChange={(e) => setAge(e.target.value)}><option value="">Qualquer</option><option value="1">1 dia ou mais</option><option value="3">3 dias ou mais</option><option value="7">7 dias ou mais</option></select></label>
    </section>
    <div className="queue-count"><strong>{filtered.length}</strong> {filtered.length === 1 ? "solicitação encontrada" : "solicitações encontradas"}</div>
    <section className="queue-list" aria-label="Solicitações">
      {filtered.map((item) => <article className="queue-item" key={item.id}>
        <div className="queue-item__main"><div className="queue-item__meta"><span className={`status-badge status-badge--${item.status}`}>{statusLabels[item.status] ?? item.status}</span><span>{item.protocol}</span><span>{levelLabels[item.level]}</span>{item.hasInternalNote && <span title="Há observação interna">● Observação interna</span>}</div><h2>{item.title}</h2><p>{item.studentName} · {item.programName}</p><small>Orientador: {item.advisorName || "Não informado"} · Enviada {new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(-Math.max(0, Math.floor((Date.now() - new Date(item.submittedAt).getTime()) / 86400000)), "day")}</small></div>
        <div className="queue-item__actions"><span>{item.assigneeName ? `Responsável: ${item.assigneeName}` : "Sem responsável"}</span>{!item.assignedTo && <button className="button button--primary button--small" disabled={pending} onClick={() => runAction("assume_cataloging_request", item.id)}>Assumir atendimento</button>}{item.assignedTo === currentUserId && <><Link className="button button--primary button--small" href={`/painel/atendimento/${item.id}`}>Abrir análise</Link><button className="text-button" disabled={pending} onClick={() => runAction("release_cataloging_request", item.id)}>Devolver à fila</button></>}{item.assignedTo && item.assignedTo !== currentUserId && <Link className="button button--secondary button--small" href={`/painel/atendimento/${item.id}`}>Visualizar</Link>}{isAdministrator && <select aria-label={`Reatribuir ${item.protocol}`} defaultValue="" onChange={(e) => reassign(item.id, e.target.value)} disabled={pending}><option value="">Reatribuir…</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select>}</div>
      </article>)}
      {filtered.length === 0 && <div className="history-empty"><div><p className="eyebrow">Fila</p><h2>Nenhuma solicitação encontrada</h2></div><p>Altere os filtros ou aguarde a entrada de novos protocolos.</p></div>}
    </section>
  </>;
}
