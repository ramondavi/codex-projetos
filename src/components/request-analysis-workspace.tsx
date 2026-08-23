"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { correctableFields } from "@/domain/issues/fields";

type IssueTemplate = { id: string; label: string; message: string };

export function RequestAnalysisWorkspace({ requestId, initialAnalysisNotes, initialInternalNote, editable, templates }: { requestId: string; initialAnalysisNotes: string; initialInternalNote: string; editable: boolean; templates: IssueTemplate[] }) {
  const router = useRouter();
  const [analysisNotes, setAnalysisNotes] = useState(initialAnalysisNotes);
  const [internalNote, setInternalNote] = useState(initialInternalNote);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [issueDetails, setIssueDetails] = useState<Record<string, { templateId: string; freeJustification: string }>>({});
  const [returning, setReturning] = useState(false);

  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (!ready || !editable) return;
    setState("saving");
    const timer = window.setTimeout(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("save_request_analysis", { target_request_id: requestId, analysis_notes_value: analysisNotes, internal_note_value: internalNote });
      setState(error ? "error" : "saved");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [analysisNotes, internalNote, requestId, ready, editable]);

  async function release() {
    const supabase = createClient();
    const { error } = await supabase.rpc("release_cataloging_request", { target_request_id: requestId });
    if (error) { setState("error"); return; }
    router.push("/painel/fila");
    router.refresh();
  }

  async function returnForCorrections() {
    setReturning(true);
    setState("idle");
    const issues = selectedFields.map((fieldKey) => ({ fieldKey, templateId: issueDetails[fieldKey]?.templateId ?? "", freeJustification: issueDetails[fieldKey]?.freeJustification ?? "" }));
    const supabase = createClient();
    const { error } = await supabase.rpc("return_request_for_corrections", { target_request_id: requestId, issues });
    if (error) { setState("error"); setReturning(false); return; }
    router.push("/painel/fila");
    router.refresh();
  }

  return <section className="analysis-workspace">
    <div className="analysis-workspace__status" role="status">{!editable ? "Somente leitura — atendimento atribuído a outro profissional" : state === "saving" ? "Salvando análise…" : state === "saved" ? "Análise salva automaticamente" : state === "error" ? "Não foi possível salvar. Verifique sua conexão." : "Salvamento automático ativo"}</div>
    <label>Análise em andamento<textarea rows={10} maxLength={20000} value={analysisNotes} onChange={(e) => setAnalysisNotes(e.target.value)} disabled={!editable} placeholder="Registre aqui conferências, ajustes necessários e encaminhamentos da análise." /></label>
    <label>Observação interna <textarea rows={5} maxLength={10000} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} disabled={!editable} placeholder="Visível somente para a equipe da biblioteca." /></label>
    {editable && <fieldset className="issue-builder"><legend>Pendências para o estudante</legend><p>Marque somente os campos que precisam ser corrigidos. Os demais ficarão bloqueados.</p><div className="issue-builder__fields">{correctableFields.map((field) => { const selected = selectedFields.includes(field.key); const detail = issueDetails[field.key] ?? { templateId: "", freeJustification: "" }; return <div className={`issue-field ${selected ? "issue-field--selected" : ""}`} key={field.key}><label className="check"><input type="checkbox" checked={selected} onChange={(event) => setSelectedFields((current) => event.target.checked ? [...current, field.key] : current.filter((key) => key !== field.key))} /> {field.label}</label>{selected && <div className="issue-field__detail"><label>Justificativa padronizada<select value={detail.templateId} onChange={(event) => setIssueDetails((current) => ({ ...current, [field.key]: { ...detail, templateId: event.target.value } }))}><option value="">Sem template</option>{templates.map((template) => <option value={template.id} key={template.id}>{template.label}</option>)}</select></label><label>Complemento ou justificativa livre<textarea rows={2} maxLength={2000} value={detail.freeJustification} onChange={(event) => setIssueDetails((current) => ({ ...current, [field.key]: { ...detail, freeJustification: event.target.value } }))} placeholder={detail.templateId ? "Opcional" : "Obrigatório quando não houver template"} /></label></div>}</div>; })}</div><button className="button button--primary" type="button" disabled={returning || selectedFields.length === 0 || selectedFields.some((key) => !(issueDetails[key]?.templateId || issueDetails[key]?.freeJustification.trim()))} onClick={returnForCorrections}>{returning ? "Enviando pendências…" : "Devolver para correção"}</button></fieldset>}
    {editable && <div className="analysis-workspace__actions"><button className="button button--secondary" type="button" onClick={release}>Devolver atendimento à fila</button></div>}
  </section>;
}
