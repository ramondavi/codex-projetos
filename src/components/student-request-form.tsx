"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compactDraft, emptyStudentRequestDraft, STUDENT_REQUEST_DRAFT_KEY, type StudentRequestDraft } from "@/domain/student-requests/draft";

type Program = { id: string; code: string; name: string; level: string; work_type: string };
const levelLabels: Record<string, string> = { undergraduate: "Graduação", specialization: "Especialização", master: "Mestrado", doctorate: "Doutorado" };
const errorLabels: Record<string, string> = {
  active_request_already_exists: "Você já possui um protocolo ativo. Acompanhe-o pelo painel.",
  active_student_required: "Sua sessão não permite abrir uma solicitação. Entre novamente.",
  active_academic_program_required: "Selecione um curso ou programa ativo.",
  valid_registration_required: "Informe uma matrícula válida, com 3 a 30 caracteres.",
  valid_title_required: "Informe o título completo do trabalho.",
  public_https_url_required: "Informe um link público seguro, iniciado por https://.",
  required_declarations_missing: "Confirme as três declarações obrigatórias.",
  author_and_advisor_required: "Informe os nomes do autor e do orientador.",
  portuguese_keyword_required: "Informe pelo menos uma palavra-chave em português.",
  valid_cataloging_years_required: "Confira os anos de depósito e de defesa.",
  valid_physical_extent_required: "Informe a quantidade de páginas ou volumes.",
  mp_cecre_volume_extent_required: "No MP-CECRE, informe 2 ou 3 volumes.",
  valid_orientation_labels_required: "Confira as designações de orientação e coorientação.",
};

export function StudentRequestForm({ programs }: { programs: Program[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<StudentRequestDraft>(emptyStudentRequestDraft);
  const [ready, setReady] = useState(false);
  const [savedAt, setSavedAt] = useState<string>();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const selectedProgram = programs.find((program) => program.id === draft.academicProgramId);
  const isMpCecre = selectedProgram?.code === "mp-cecre-master";

  useEffect(() => {
    const stored = localStorage.getItem(STUDENT_REQUEST_DRAFT_KEY);
    if (stored) {
      try { setDraft({ ...emptyStudentRequestDraft, ...JSON.parse(stored) }); } catch { localStorage.removeItem(STUDENT_REQUEST_DRAFT_KEY); }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(STUDENT_REQUEST_DRAFT_KEY, JSON.stringify(draft));
      setSavedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, ready]);

  const set = <K extends keyof StudentRequestDraft>(key: K, value: StudentRequestDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const setListItem = (key: "otherTitles" | "keywordsPt" | "keywordsEn", index: number, value: string) =>
    setDraft((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => itemIndex === index ? value : item) }));
  const addListItem = (key: "otherTitles" | "keywordsPt" | "keywordsEn") => setDraft((current) => ({ ...current, [key]: [...current[key], ""] }));
  const removeListItem = (key: "otherTitles" | "keywordsPt" | "keywordsEn", index: number) =>
    setDraft((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);
    const payload = compactDraft(draft);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("open_student_request_v2", { payload });
    if (rpcError) {
      const known = Object.keys(errorLabels).find((code) => rpcError.message.includes(code));
      setError(known ? errorLabels[known] : "Não foi possível enviar a solicitação. Revise os campos e tente novamente.");
      setSubmitting(false);
      return;
    }
    localStorage.removeItem(STUDENT_REQUEST_DRAFT_KEY);
    const protocol = Array.isArray(data) ? data[0]?.generated_protocol : undefined;
    router.push(`/painel/solicitacao?enviada=1${protocol ? `&protocolo=${encodeURIComponent(protocol)}` : ""}`);
    router.refresh();
  }

  return (
    <form className="request-form" onSubmit={submit}>
      <div className="draft-status" role="status">{savedAt ? `Rascunho salvo neste dispositivo às ${savedAt}` : "O rascunho será salvo automaticamente neste dispositivo."}</div>
      {error && <div className="auth-feedback auth-feedback--error" role="alert">{error}</div>}

      <fieldset className="form-section">
        <legend><span>01</span> Vínculo acadêmico</legend>
        <div className="form-row">
          <label>Curso ou programa <select required value={draft.academicProgramId} onChange={(e) => { const program = programs.find((item) => item.id === e.target.value); setDraft((current) => ({ ...current, academicProgramId: e.target.value, extentUnit: program?.code === "mp-cecre-master" ? "volumes" : "pages", extentCount: program?.code === "mp-cecre-master" ? "2" : "" })); }}><option value="">Selecione</option>{programs.map((program) => <option key={program.id} value={program.id}>{levelLabels[program.level]} · {program.name}</option>)}</select></label>
          <label>Matrícula atual <input required minLength={3} maxLength={30} value={draft.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} placeholder="Sua matrícula neste vínculo" /></label>
        </div>
        <p className="field-help">A matrícula ficará associada a este vínculo. Em um futuro grau acadêmico, você poderá cadastrar outra.</p>
      </fieldset>

      <fieldset className="form-section">
        <legend><span>02</span> Trabalho</legend>
        <label>Autor — como aparece na folha de rosto <input required minLength={3} value={draft.people.author} onChange={(e) => set("people", { ...draft.people, author: e.target.value })} /></label>
        <label>Título completo <textarea required minLength={3} maxLength={500} rows={2} value={draft.title} onChange={(e) => set("title", e.target.value)} /></label>
        <div className="form-row">
          <label>Subtítulo <input value={draft.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></label>
          <label>Título equivalente <input value={draft.equivalentTitle} onChange={(e) => set("equivalentTitle", e.target.value)} placeholder="Quando houver" /></label>
        </div>
        <DynamicFields label="Outro título" values={draft.otherTitles} onChange={(i, v) => setListItem("otherTitles", i, v)} onAdd={() => addListItem("otherTitles")} onRemove={(i) => removeListItem("otherTitles", i)} />
        <div className="form-row">
          <label>Designação na página de rosto <input required minLength={3} maxLength={60} value={draft.people.advisorNoteLabel} onChange={(e) => set("people", { ...draft.people, advisorNoteLabel: e.target.value })} placeholder="Ex.: Orientador, Orientadora" /></label>
          <label>Nome da orientação — como aparece no trabalho <input required minLength={3} value={draft.people.advisor} onChange={(e) => set("people", { ...draft.people, advisor: e.target.value })} /></label>
        </div>
        <div className="form-row"><label>Designação da coorientação <input minLength={3} maxLength={60} value={draft.people.coadvisorNoteLabel} onChange={(e) => set("people", { ...draft.people, coadvisorNoteLabel: e.target.value })} placeholder="Ex.: Coorientador, Co-orientadora" /></label><label>Nome da coorientação — como aparece no trabalho <input value={draft.people.coadvisor} onChange={(e) => set("people", { ...draft.people, coadvisor: e.target.value })} placeholder="Quando houver" /></label></div>
        <div className="special-cases"><span>Casos especiais, quando aplicáveis</span>{[["coadvisor", "Coorientação"], ["cotutelle", "Cotutela"], ["double_degree", "Dupla titulação"]].map(([value, label]) => <label className="check" key={value}><input type="checkbox" checked={draft.specialCases.includes(value)} onChange={(e) => set("specialCases", e.target.checked ? [...draft.specialCases, value] : draft.specialCases.filter((item) => item !== value))} /> {label}</label>)}</div>
        <div className="form-row"><label>Ano de depósito da versão final <input required type="number" min="1900" max="9999" value={draft.depositYear} onChange={(e) => set("depositYear", e.target.value)} /></label><label>Ano de defesa ou apresentação <input required type="number" min="1900" max={draft.depositYear || "9999"} value={draft.defenseYear} onChange={(e) => set("defenseYear", e.target.value)} /></label></div>
        <div className="form-row">
          {isMpCecre ? <label>Quantidade de volumes <select required value={draft.extentCount} onChange={(e) => set("extentCount", e.target.value)}><option value="2">2 volumes</option><option value="3">3 volumes</option></select></label> : <label>Quantidade total de páginas <input required type="number" min="1" max="99999" value={draft.extentCount} onChange={(e) => set("extentCount", e.target.value)} /></label>}
          <label className="check"><input type="checkbox" checked={draft.hasIllustrations} onChange={(e) => set("hasIllustrations", e.target.checked)} /> O trabalho possui ilustrações (`il.`)</label>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend><span>03</span> Palavras-chave</legend>
        <DynamicFields label="Palavra-chave em português" required values={draft.keywordsPt} onChange={(i, v) => setListItem("keywordsPt", i, v)} onAdd={() => addListItem("keywordsPt")} onRemove={(i) => removeListItem("keywordsPt", i)} />
        <DynamicFields label="Palavra-chave em inglês" values={draft.keywordsEn} onChange={(i, v) => setListItem("keywordsEn", i, v)} onAdd={() => addListItem("keywordsEn")} onRemove={(i) => removeListItem("keywordsEn", i)} />
      </fieldset>

      <fieldset className="form-section">
        <legend><span>04</span> Arquivo e declarações</legend>
        <label>Link público do trabalho completo <input required type="url" pattern="https://.*" value={draft.publicWorkUrl} onChange={(e) => set("publicWorkUrl", e.target.value)} placeholder="https://..." /></label>
        <p className="field-help">Teste o link em uma janela anônima. O Pronto! não recebe nem armazena o PDF do trabalho.</p>
        <div className="declarations">
          <label className="check"><input required type="checkbox" checked={draft.defendedAndApproved} onChange={(e) => set("defendedAndApproved", e.target.checked)} /> Declaro que o trabalho foi defendido e aprovado por banca.</label>
          <label className="check"><input required type="checkbox" checked={draft.finalFileConfirmed} onChange={(e) => set("finalFileConfirmed", e.target.checked)} /> Confirmo que este é o arquivo completo e finalizado.</label>
          <label className="check"><input required type="checkbox" checked={draft.approvalPageConfirmed} onChange={(e) => set("approvalPageConfirmed", e.target.checked)} /> Confirmo que o arquivo contém a folha de aprovação assinada ou digitalizada.</label>
        </div>
        <label>Observação para a biblioteca <textarea maxLength={2000} rows={4} value={draft.libraryNote} onChange={(e) => set("libraryNote", e.target.value)} placeholder="Opcional" /></label>
      </fieldset>

      <div className="submit-panel"><div><strong>Revise antes de enviar</strong><p>Após o envio, o sistema criará um protocolo interno. O atendimento bibliotecário será disponibilizado em um próximo incremento.</p></div><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? "Enviando…" : "Enviar solicitação"}</button></div>
    </form>
  );
}

function DynamicFields({ label, values, required, onChange, onAdd, onRemove }: { label: string; values: string[]; required?: boolean; onChange: (index: number, value: string) => void; onAdd: () => void; onRemove: (index: number) => void }) {
  return <div className="dynamic-fields"><span>{label}</span>{values.map((value, index) => <div className="dynamic-field" key={index}><input aria-label={`${label} ${index + 1}`} required={required && index === 0} minLength={required && index === 0 ? 2 : undefined} value={value} onChange={(e) => onChange(index, e.target.value)} />{values.length > 1 && <button type="button" className="text-button" onClick={() => onRemove(index)} aria-label={`Remover ${label.toLowerCase()} ${index + 1}`}>Remover</button>}</div>)}<button type="button" className="add-field" onClick={onAdd}>+ Adicionar campo</button></div>;
}
