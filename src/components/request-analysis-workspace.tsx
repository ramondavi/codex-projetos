"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type IssueTemplate = { id: string; label: string; message: string };
export type ReviewField = { key: string; label: string; value: string; multiline?: boolean };
type IssueDetail = { templateId: string; freeJustification: string };

export function RequestAnalysisWorkspace({ requestId, initialAnalysisNotes, initialInternalNote, editable, templates, fields }: { requestId: string; initialAnalysisNotes: string; initialInternalNote: string; editable: boolean; templates: IssueTemplate[]; fields: ReviewField[] }) {
  const router = useRouter();
  const [analysisNotes, setAnalysisNotes] = useState(initialAnalysisNotes);
  const [internalNote, setInternalNote] = useState(initialInternalNote);
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field.key, field.value])));
  const [validated, setValidated] = useState<string[]>([]);
  const [editing, setEditing] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [issueDetails, setIssueDetails] = useState<Record<string, IssueDetail>>({});
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [returning, setReturning] = useState(false);

  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (!ready || !editable) return;
    setState("saving");
    const timer = window.setTimeout(async () => {
      const { error } = await createClient().rpc("save_request_analysis", { target_request_id: requestId, analysis_notes_value: analysisNotes, internal_note_value: internalNote });
      setState(error ? "error" : "saved");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [analysisNotes, internalNote, requestId, ready, editable]);

  async function correct(fieldKey: string) {
    setState("saving");
    const field = fields.find((item) => item.key === fieldKey);
    const raw = values[fieldKey] ?? "";
    const correctedValue = field?.multiline && fieldKey.startsWith("keywords_") ? raw.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean) : raw;
    const { error } = await createClient().rpc("staff_correct_request_field", { target_request_id: requestId, field_key_value: fieldKey, corrected_value: correctedValue });
    if (error) { setState("error"); return; }
    setEditing((current) => current.filter((key) => key !== fieldKey));
    setValidated((current) => current.includes(fieldKey) ? current : [...current, fieldKey]);
    setState("saved");
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

  return <section className="analysis-workspace panel">
    <div className="analysis-workspace__status" role="status">{!editable ? "Somente leitura nesta etapa" : state === "saving" ? "Salvando…" : state === "saved" ? "Alterações salvas" : state === "error" ? "Não foi possível salvar. Verifique os dados ou a conexão." : "Validação por campo ativa"}</div>
    <div className="field-review-list">{fields.map((field) => {
      const isEditing = editing.includes(field.key); const isPending = selectedFields.includes(field.key); const isValidated = validated.includes(field.key); const detail = issueDetails[field.key] ?? { templateId: "", freeJustification: "" };
      return <article className={`field-review ${isValidated ? "field-review--valid" : ""} ${isPending ? "field-review--invalid" : ""}`} key={field.key}>
        <div className="field-review__value"><span>{field.label}</span>{isEditing ? field.multiline ? <textarea rows={3} value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} /> : <input value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} /> : <strong>{values[field.key] || "—"}</strong>}</div>
        {editable && <div className="field-review__actions">{isEditing ? <><button className="button button--primary button--small" type="button" onClick={() => correct(field.key)}>Salvar correção</button><button className="text-action" type="button" onClick={() => setEditing((current) => current.filter((key) => key !== field.key))}>Cancelar</button></> : <><button className="button button--secondary button--small" type="button" onClick={() => { setValidated((current) => current.includes(field.key) ? current : [...current, field.key]); setSelectedFields((current) => current.filter((key) => key !== field.key)); }}>✓ Validar</button><button className="button button--secondary button--small" type="button" onClick={() => setEditing((current) => [...current, field.key])}>Corrigir aqui</button><button className="button button--secondary button--small" type="button" onClick={() => { setSelectedFields((current) => current.includes(field.key) ? current : [...current, field.key]); setValidated((current) => current.filter((key) => key !== field.key)); }}>Devolver ao estudante</button></>}</div>}
        {isPending && <div className="field-review__issue"><label>Mensagem de correção<select value={detail.templateId} onChange={(event) => setIssueDetails((current) => ({ ...current, [field.key]: { ...detail, templateId: event.target.value } }))}><option value="">Sem template</option>{templates.map((template) => <option value={template.id} key={template.id}>{template.label}</option>)}</select></label><label>Complemento ou justificativa<textarea rows={2} maxLength={2000} value={detail.freeJustification} onChange={(event) => setIssueDetails((current) => ({ ...current, [field.key]: { ...detail, freeJustification: event.target.value } }))} placeholder={detail.templateId ? "Opcional" : "Obrigatório sem template"} /></label></div>}
      </article>;
    })}</div>
    <label>Análise em andamento<textarea rows={6} maxLength={20000} value={analysisNotes} onChange={(event) => setAnalysisNotes(event.target.value)} disabled={!editable} /></label>
    <label>Observação interna<textarea rows={4} maxLength={10000} value={internalNote} onChange={(event) => setInternalNote(event.target.value)} disabled={!editable} /></label>
    {editable && <div className="analysis-workspace__actions"><button className="button button--primary" type="button" disabled={returning || selectedFields.length === 0 || selectedFields.some((key) => !(issueDetails[key]?.templateId || issueDetails[key]?.freeJustification.trim()))} onClick={returnForCorrections}>{returning ? "Enviando…" : `Devolver ${selectedFields.length} campo(s) ao estudante`}</button><button className="button button--secondary" type="button" onClick={release}>Devolver atendimento à fila</button></div>}
  </section>;
}
