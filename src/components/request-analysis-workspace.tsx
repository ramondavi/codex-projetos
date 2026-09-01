"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type IssueTemplate = { id: string; label: string; message: string };
export type ReviewField = { key: string; label: string; value: string; multiline?: boolean };
type IssueDetail = { templateId: string; freeJustification: string };

function savedAtLabel(savedAt: string | null, now: number) {
  if (!savedAt) return "Alterações salvas";
  const date = new Date(savedAt); const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));
  const exact = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}, às ${String(date.getHours()).padStart(2, "0")}h${String(date.getMinutes()).padStart(2, "0")}`;
  return `${seconds < 60 ? `Alterações salvas há ${seconds} ${seconds === 1 ? "segundo" : "segundos"}` : "Alterações salvas"} (${exact})`;
}

export function RequestAnalysisWorkspace({ requestId, initialAnalysisNotes, initialInternalNote, initialSavedAt, initialReviewCompletedAt, editable, templates, fields }: { requestId: string; initialAnalysisNotes: string; initialInternalNote: string; initialSavedAt: string | null; initialReviewCompletedAt: string | null; editable: boolean; templates: IssueTemplate[]; fields: ReviewField[] }) {
  const router = useRouter();
  const [analysisNotes, setAnalysisNotes] = useState(initialAnalysisNotes);
  const [internalNote, setInternalNote] = useState(initialInternalNote);
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field.key, field.value])));
  const [validated, setValidated] = useState<string[]>([]);
  const [corrected, setCorrected] = useState<string[]>([]);
  const [editing, setEditing] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [issueDetails, setIssueDetails] = useState<Record<string, IssueDetail>>({});
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [returning, setReturning] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialSavedAt);
  const [reviewCompletedAt, setReviewCompletedAt] = useState<string | null>(initialReviewCompletedAt);
  const [resetting, setResetting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [actionsTarget, setActionsTarget] = useState<Element | null>(null);
  const savedText = useRef({ analysisNotes: initialAnalysisNotes, internalNote: initialInternalNote });

  useEffect(() => setReady(true), []);
  useEffect(() => setActionsTarget(document.getElementById("request-analysis-actions-end")), []);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (!ready || !editable) return;
    if (analysisNotes === savedText.current.analysisNotes && internalNote === savedText.current.internalNote) return;
    setState("saving");
    const timer = window.setTimeout(async () => {
      const { data, error } = await createClient().rpc("save_request_analysis", { target_request_id: requestId, analysis_notes_value: analysisNotes, internal_note_value: internalNote });
      if (error) setState("error"); else { savedText.current = { analysisNotes, internalNote }; setLastSavedAt(data); setState("saved"); }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [analysisNotes, internalNote, requestId, ready, editable]);

  async function correct(fieldKey: string) {
    const field = fields.find((item) => item.key === fieldKey);
    const raw = values[fieldKey] ?? "";
    const correctedValue = field?.multiline && fieldKey.startsWith("keywords_") ? raw.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean) : raw;
    const originalValue = field?.multiline && fieldKey.startsWith("keywords_") ? (field.value ?? "").split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean) : field?.value ?? "";
    if (JSON.stringify(correctedValue) === JSON.stringify(originalValue)) {
      setEditing((current) => current.filter((key) => key !== fieldKey));
      setState("idle");
      return;
    }
    setState("saving");
    const { error } = await createClient().rpc("staff_correct_request_field", { target_request_id: requestId, field_key_value: fieldKey, corrected_value: correctedValue });
    if (error) { setState("error"); return; }
    setEditing((current) => current.filter((key) => key !== fieldKey));
    setValidated((current) => current.includes(fieldKey) ? current : [...current, fieldKey]);
    setCorrected((current) => current.includes(fieldKey) ? current : [...current, fieldKey]);
    setLastSavedAt(new Date().toISOString());
    setState("saved");
  }
  async function resetDirectCorrections() {
    if (!window.confirm("Limpar as correções diretas feitas nesta análise e restaurar os valores enviados pelo estudante?")) return;
    setResetting(true); setState("saving");
    const { error } = await createClient().rpc("reset_direct_request_corrections", { target_request_id: requestId });
    if (error) { setState("error"); setResetting(false); return; }
    router.refresh();
  }
  async function completeReview() {
    setCompleting(true); setState("saving");
    const { data, error } = await createClient().rpc("complete_request_analysis", { target_request_id: requestId });
    if (error) { setState("error"); setCompleting(false); return; }
    setReviewCompletedAt(data); setLastSavedAt(data); setCompleting(false); setState("saved");
  }
  async function release() {
    const { error } = await createClient().rpc("release_cataloging_request", { target_request_id: requestId });
    if (error) { setState("error"); return; }
    router.push("/painel/fila"); router.refresh();
  }
  async function returnForCorrections() {
    setReturning(true);
    const issues = selectedFields.map((fieldKey) => ({ fieldKey, templateId: issueDetails[fieldKey]?.templateId ?? "", freeJustification: issueDetails[fieldKey]?.freeJustification ?? "" }));
    const { error } = await createClient().rpc("return_request_for_corrections", { target_request_id: requestId, issues });
    if (error) { setState("error"); setReturning(false); return; }
    router.push("/painel/fila"); router.refresh();
  }

  const actions = editable && <div className="analysis-workspace__actions analysis-workspace__actions--final"><button className="button button--primary" type="button" disabled={returning || selectedFields.length === 0 || selectedFields.some((key) => !(issueDetails[key]?.templateId || issueDetails[key]?.freeJustification.trim()))} onClick={returnForCorrections}>{returning ? "Enviando…" : `Devolver ${selectedFields.length} campo(s) ao estudante`}</button><button className="button button--secondary" type="button" disabled={resetting || completing} onClick={resetDirectCorrections}>{resetting ? "Restaurando…" : "Limpar correções diretas"}</button><button className={`button button--secondary ${reviewCompletedAt ? "analysis-workspace__action--completed" : ""}`} type="button" disabled={completing || resetting} onClick={completeReview}>{completing ? "Registrando…" : reviewCompletedAt ? "✓ Revisão concluída" : "Concluir revisão e prosseguir"}</button><button className="button button--secondary" type="button" onClick={release}>Devolver atendimento à fila</button></div>;

  return <><section className="analysis-workspace">
    <div className="analysis-workspace__status" role="status">{!editable ? "Somente leitura nesta etapa" : state === "saving" ? "Salvando…" : state === "saved" ? savedAtLabel(lastSavedAt, now) : state === "error" ? "Não foi possível salvar. Verifique os dados ou a conexão." : "Validação por campo ativa"}</div>
    <div className="field-review-list">{fields.map((field) => {
      const isEditing = editing.includes(field.key); const isPending = selectedFields.includes(field.key); const isValidated = validated.includes(field.key); const isCorrected = corrected.includes(field.key); const detail = issueDetails[field.key] ?? { templateId: "", freeJustification: "" };
      return <article className={`field-review ${isValidated ? "field-review--valid" : ""} ${isCorrected ? "field-review--corrected" : ""} ${isPending ? "field-review--invalid" : ""}`} key={field.key}>
        <div className="field-review__value"><span>{field.label}</span>{isEditing ? field.multiline ? <textarea rows={3} value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} /> : <input value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} /> : <strong>{values[field.key] || "—"}</strong>}</div>
        {editable && <div className="field-review__actions">{isEditing ? <><button className="button button--small field-review__action--editing" type="button" onClick={() => correct(field.key)}>Salvar correção</button><button className="text-action" type="button" onClick={() => setEditing((current) => current.filter((key) => key !== field.key))}>Cancelar</button></> : <><button className={`button button--secondary button--small ${isCorrected ? "field-review__action--corrected" : isValidated ? "field-review__action--valid" : ""}`} type="button" onClick={() => { setValidated((current) => current.includes(field.key) ? current : [...current, field.key]); setCorrected((current) => current.filter((key) => key !== field.key)); setSelectedFields((current) => current.filter((key) => key !== field.key)); }}>{isCorrected ? "✓ Corrigido" : "✓ Validar"}</button><button className="button button--secondary button--small" type="button" onClick={() => setEditing((current) => [...current, field.key])}>Corrigir aqui</button><button className={`button button--secondary button--small ${isPending ? "field-review__action--invalid" : ""}`} type="button" onClick={() => { setSelectedFields((current) => current.includes(field.key) ? current : [...current, field.key]); setValidated((current) => current.filter((key) => key !== field.key)); setCorrected((current) => current.filter((key) => key !== field.key)); }}>Devolver ao estudante</button></>}</div>}
        {isPending && <div className="field-review__issue"><label>Mensagem de correção<select value={detail.templateId} onChange={(event) => setIssueDetails((current) => ({ ...current, [field.key]: { ...detail, templateId: event.target.value } }))}><option value="">Sem template</option>{templates.map((template) => <option value={template.id} key={template.id}>{template.label}</option>)}</select></label><label>Complemento ou justificativa<textarea rows={2} maxLength={2000} value={detail.freeJustification} onChange={(event) => setIssueDetails((current) => ({ ...current, [field.key]: { ...detail, freeJustification: event.target.value } }))} placeholder={detail.templateId ? "Opcional" : "Obrigatório sem template"} /></label></div>}
      </article>;
    })}</div>
    <label>Análise em andamento<textarea rows={6} maxLength={20000} value={analysisNotes} onChange={(event) => setAnalysisNotes(event.target.value)} disabled={!editable} /></label>
    <label>Observação interna<textarea rows={4} maxLength={10000} value={internalNote} onChange={(event) => setInternalNote(event.target.value)} disabled={!editable} /></label>
  </section>{actionsTarget && actions ? createPortal(actions, actionsTarget) : null}</>;
}
