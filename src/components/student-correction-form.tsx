"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PendingField = { fieldKey: string; fieldLabel: string; justification: string; kind: string; value: string | string[] };
type Program = { id: string; name: string; level: string };
const levelLabels: Record<string, string> = { undergraduate: "Graduação", specialization: "Especialização", master: "Mestrado", doctorate: "Doutorado" };

export function StudentCorrectionForm({ requestId, fields, programs }: { requestId: string; fields: PendingField[]; programs: Program[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | string[]>>(Object.fromEntries(fields.map((field) => [field.fieldKey, field.value])));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(undefined);
    const corrections = fields.map((field) => ({ fieldKey: field.fieldKey, value: values[field.fieldKey] }));
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("submit_request_corrections", { target_request_id: requestId, corrections });
    if (rpcError) { setError("Não foi possível enviar as correções. Revise os campos destacados."); setSubmitting(false); return; }
    router.push("/painel/solicitacao?corrigida=1"); router.refresh();
  }

  return <form className="correction-form" onSubmit={submit}>
    {error && <div className="auth-feedback auth-feedback--error" role="alert">{error}</div>}
    <div className="locked-fields-note"><strong>Os campos já aprovados estão protegidos.</strong><p>Você está reenviando somente as informações solicitadas pela biblioteca.</p></div>
    {fields.map((field) => <section className="correction-field" key={field.fieldKey}><div className="correction-field__heading"><div><span>Pendência</span><h2>{field.fieldLabel}</h2></div><p>{field.justification}</p></div><CorrectionInput field={field} value={values[field.fieldKey]} programs={programs} onChange={(value) => setValues((current) => ({ ...current, [field.fieldKey]: value }))} /></section>)}
    <div className="submit-panel"><div><strong>Enviar somente estas correções</strong><p>A biblioteca receberá um histórico com os valores anteriores e corrigidos.</p></div><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? "Enviando…" : "Reenviar correções"}</button></div>
  </form>;
}

function CorrectionInput({ field, value, programs, onChange }: { field: PendingField; value: string | string[]; programs: Program[]; onChange: (value: string | string[]) => void }) {
  const textValue = Array.isArray(value) ? value.join("\n") : value ?? "";
  if (field.kind === "program") return <label>Novo valor<select required value={textValue} onChange={(event) => onChange(event.target.value)}><option value="">Selecione</option>{programs.map((program) => <option value={program.id} key={program.id}>{levelLabels[program.level]} · {program.name}</option>)}</select></label>;
  if (field.kind === "list") return <label>Novo valor <small>Um item por linha</small><textarea required={field.fieldKey === "keywords_pt"} rows={4} value={textValue} onChange={(event) => onChange(event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} /></label>;
  if (field.kind === "textarea") return <label>Novo valor<textarea required={field.fieldKey === "title"} rows={4} value={textValue} onChange={(event) => onChange(event.target.value)} /></label>;
  return <label>Novo valor<input required={["title", "author", "advisor", "registration_number", "public_work_url"].includes(field.fieldKey)} type={field.kind === "url" ? "url" : "text"} value={textValue} onChange={(event) => onChange(event.target.value)} /></label>;
}
