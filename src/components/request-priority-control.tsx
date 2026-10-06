"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PriorityBadge } from "./priority-badge";

export const priorityReasons: Record<string, string> = {
  institutional_deadline: "Prazo institucional próximo",
  urgent_correction: "Correção urgente após devolução",
  coordination_request: "Demanda da coordenação",
  other_documented: "Outro motivo documentado",
};

export function RequestPriorityControl({ requestId, initialReasonCode, initialReasonDetail, compact = false }: {
  requestId: string; initialReasonCode: string | null; initialReasonDetail: string | null; compact?: boolean;
}) {
  const router = useRouter();
  const [savedCode, setSavedCode] = useState(initialReasonCode);
  const [savedDetail, setSavedDetail] = useState(initialReasonDetail);
  const [reasonCode, setReasonCode] = useState(initialReasonCode ?? "");
  const [reasonDetail, setReasonDetail] = useState(initialReasonDetail ?? "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

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

  return <section className={`request-priority-control${compact ? " request-priority-control--compact" : ""}`} aria-label="Prioridade do atendimento">
    <div className="request-priority-control__summary">
      <div><strong>Prioridade do protocolo</strong>{savedCode ? <p><PriorityBadge reason={priorityReasons[savedCode]} /> Motivo: {priorityReasons[savedCode]}{savedDetail ? ` — ${savedDetail}` : ""}</p> : <p>Atendimento sem sinalização de prioridade.</p>}</div>
      <button className="button button--secondary button--small" type="button" onClick={() => { setEditing((value) => !value); setError(""); }} aria-expanded={editing}>{savedCode ? "Alterar prioridade" : "Marcar como prioritário"}</button>
    </div>
    {editing && <div className="request-priority-control__form">
      <label>Justificativa obrigatória<select value={reasonCode} onChange={(event) => setReasonCode(event.target.value)} required><option value="">Selecione o motivo</option>{Object.entries(priorityReasons).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
      {reasonCode === "other_documented" && <label>Descreva o motivo<textarea value={reasonDetail} onChange={(event) => setReasonDetail(event.target.value)} minLength={10} maxLength={500} rows={2} required /></label>}
      {error && <p className="auth-feedback auth-feedback--error" role="alert">{error}</p>}
      <div className="request-priority-control__actions"><button className="button button--primary button--small" type="button" disabled={pending || !reasonCode} onClick={() => save(reasonCode)}>Salvar prioridade</button>{savedCode && <button className="button button--secondary button--small" type="button" disabled={pending} onClick={() => save(null)}>Retirar prioridade</button>}</div>
    </div>}
  </section>;
}
