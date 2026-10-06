"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PriorityBadge } from "./priority-badge";
import { ModalCloseButton } from "./modal-close-button";
import { AppIcon } from "./app-icon";

export const priorityReasons: Record<string, string> = {
  institutional_deadline: "Prazo institucional próximo",
  urgent_correction: "Correção urgente após devolução",
  coordination_request: "Demanda da coordenação",
  other_documented: "Outro motivo documentado",
};

export function RequestPriorityControl({ requestId, initialReasonCode, initialReasonDetail, menuItem = false, compact = false }: {
  requestId: string; initialReasonCode: string | null; initialReasonDetail: string | null; menuItem?: boolean; compact?: boolean;
}) {
  const router = useRouter();
  const [savedCode, setSavedCode] = useState(initialReasonCode);
  const [savedDetail, setSavedDetail] = useState(initialReasonDetail);
  const [reasonCode, setReasonCode] = useState(initialReasonCode ?? "");
  const [reasonDetail, setReasonDetail] = useState(initialReasonDetail ?? "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  useEffect(() => { setSavedCode(initialReasonCode); setSavedDetail(initialReasonDetail); setReasonCode(initialReasonCode ?? ""); setReasonDetail(initialReasonDetail ?? ""); }, [initialReasonCode, initialReasonDetail]);

  function save(code: string | null) {
    setError("");
    if (code === "other_documented" && reasonDetail.trim().length < 10) {
      setError("Descreva o motivo em pelo menos 10 caracteres.");
      return;
    }
    startTransition(async () => {
      const detail = code === "other_documented" ? reasonDetail.trim() : null;
      const { error: saveError } = await createClient().rpc("set_request_priority", {
        target_request_id: requestId, selected_reason_code: code, selected_reason_detail: detail,
      });
      if (saveError) { setError("Não foi possível atualizar a prioridade. Tente novamente."); return; }
      setSavedCode(code);
      setSavedDetail(detail);
      setReasonCode(code ?? "");
      setReasonDetail(detail ?? "");
      setEditing(false);
      router.refresh();
    });
  }

  return <div className="request-priority-control" aria-label="Prioridade do atendimento">
    <button className={menuItem || compact ? "protocol-actions-menu__item" : `button button--small button--with-icon ${savedCode ? "request-priority-control__button--active" : "button--secondary"}`} type="button" onClick={() => { setEditing(true); setError(""); }} aria-haspopup="dialog" aria-label={savedCode ? "Atendimento prioritário. Alterar prioridade" : "Marcar como prioritário"} title={savedCode ? `Prioritário: ${priorityReasons[savedCode] ?? "motivo registrado"}. Clique para alterar.` : undefined}><AppIcon name="star" />{savedCode ? "Alterar prioridade" : "Marcar como prioritário"}</button>
    {editing && <div className="request-priority-control__overlay pronto-modal-overlay"><section className="request-priority-control__dialog pronto-modal-surface" role="dialog" aria-modal="true" aria-label="Prioridade do protocolo">
      <ModalCloseButton onClick={() => setEditing(false)} disabled={pending} />
      <p className="eyebrow">Organização da fila</p><h2>Prioridade do protocolo</h2>
      {savedCode ? <p className="request-priority-control__current"><PriorityBadge reason={priorityReasons[savedCode]} /> Motivo atual: {priorityReasons[savedCode]}{savedDetail ? ` — ${savedDetail}` : ""}</p> : <p>Registre o motivo para destacar este atendimento na fila interna.</p>}
      <div className="request-priority-control__form">
      <label>Justificativa obrigatória<select value={reasonCode} onChange={(event) => setReasonCode(event.target.value)} required><option value="">Selecione o motivo</option>{Object.entries(priorityReasons).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
      {reasonCode === "other_documented" && <label>Descreva o motivo<textarea value={reasonDetail} onChange={(event) => setReasonDetail(event.target.value)} minLength={10} maxLength={500} rows={2} required /></label>}
      {error && <p className="auth-feedback auth-feedback--error" role="alert">{error}</p>}
      <div className="request-priority-control__actions"><button className="button button--primary button--small" type="button" disabled={pending || !reasonCode} onClick={() => save(reasonCode)}>Salvar prioridade</button>{savedCode && <button className="button button--secondary button--small" type="button" disabled={pending} onClick={() => save(null)}>Retirar prioridade</button>}</div>
      </div>
    </section></div>}
  </div>;
}
