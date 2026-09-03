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
  illustrations_choice_required: "Informe se o trabalho possui ilustrações.",
  mp_cecre_volume_extent_required: "No MP-CECRE, informe 2 ou 3 volumes.",
  valid_orientation_labels_required: "Confira as designações de orientação e coorientação.",
  three_keywords_required: "Informe pelo menos três palavras-chave em português e três no idioma complementar.",
  shared_authorship_not_allowed: "A autoria compartilhada é permitida somente no RAU+E.",
  valid_birth_year_required: "Informe um ano de nascimento válido.",
  birth_year_acknowledgement_required: "Para informar o ano de nascimento, confirme sua ciência sobre o uso na ficha.",
};

export function StudentRequestForm({ programs }: { programs: Program[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<StudentRequestDraft>(emptyStudentRequestDraft);
  const [ready, setReady] = useState(false);
  const [savedAt, setSavedAt] = useState<string>();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const selectedProgram = programs.find((program) => program.id === draft.academicProgramId);
  const isMpCecre = selectedProgram?.code === "mp-cecre-master";
  const isRaue = selectedProgram?.code === "athdc-specialization";

  useEffect(() => {
    const stored = localStorage.getItem(STUDENT_REQUEST_DRAFT_KEY);
    if (stored) {
      try { const parsed = JSON.parse(stored); setDraft({ ...emptyStudentRequestDraft, ...parsed, people: { ...emptyStudentRequestDraft.people, ...parsed.people }, hasIllustrations: typeof parsed.hasIllustrations === "boolean" ? parsed.hasIllustrations ? "yes" : "no" : parsed.hasIllustrations ?? "" }); } catch { localStorage.removeItem(STUDENT_REQUEST_DRAFT_KEY); }
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
    const { data, error: rpcError } = await supabase.rpc("open_student_request_v6", { payload });
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
    <form className="request-form" onSubmit={submit} data-active-step={activeStep}>
      {error && <div className="auth-feedback auth-feedback--error" role="alert">{error}</div>}
      <div className="admin-tabs request-steps" role="tablist" aria-label="Etapas do formulário">{["Vínculo acadêmico", "Descrição do trabalho", "Palavras-chave", "Arquivo e declarações", "Revisão"].map((label, index) => <button key={label} type="button" role="tab" aria-selected={activeStep === index + 1} className={activeStep === index + 1 ? "is-active" : ""} onClick={() => setActiveStep(index + 1)}>{label}</button>)}</div>

      <fieldset className="form-section form-step form-step--1">
        <legend className="sr-only">Vínculo acadêmico</legend>
        <div className="form-row">
          <label>Curso ou programa <select required value={draft.academicProgramId} onChange={(e) => { const program = programs.find((item) => item.id === e.target.value); setDraft((current) => ({ ...current, academicProgramId: e.target.value, extentUnit: program?.code === "mp-cecre-master" ? "volumes" : "pages", extentCount: program?.code === "mp-cecre-master" ? "2" : "" })); }}><option value="">Selecione</option>{programs.map((program) => <option key={program.id} value={program.id}>{levelLabels[program.level]} · {program.name}</option>)}</select></label>
          <label>Matrícula atual <input required minLength={3} maxLength={30} value={draft.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} placeholder="Sua matrícula neste vínculo" /></label>
        </div>
        <p className="field-help">A matrícula ficará associada a este vínculo. Em um futuro grau acadêmico, você poderá cadastrar outra.</p>
      </fieldset>

      <fieldset className="form-section form-step form-step--2">
        <legend className="sr-only">Trabalho</legend>
        <p className="form-section__intro">Todas as informações devem corresponder exatamente ao que está escrito no próprio trabalho.</p>
        <label>Autor — como aparece na folha de rosto <input required minLength={3} value={draft.people.author} onChange={(e) => set("people", { ...draft.people, author: e.target.value })} /></label>
        {isRaue && <DynamicFields label="Autor adicional — como aparece na folha de rosto" values={draft.people.additionalAuthors} onChange={(index, value) => set("people", { ...draft.people, additionalAuthors: draft.people.additionalAuthors.map((item, position) => position === index ? value : item) })} onAdd={() => set("people", { ...draft.people, additionalAuthors: [...draft.people.additionalAuthors, ""] })} onRemove={(index) => set("people", { ...draft.people, additionalAuthors: draft.people.additionalAuthors.filter((_, position) => position !== index) })} />}
        <label>Ano de nascimento do autor <input type="number" min="1900" max={new Date().getFullYear()} value={draft.people.birthYear} onChange={(e) => set("people", { ...draft.people, birthYear: e.target.value, birthYearAcknowledged: e.target.value ? draft.people.birthYearAcknowledged : false })} placeholder="Opcional" /></label>
        <p className="field-help">O ano ajuda a diferenciar pessoas com o mesmo nome na ficha catalográfica. Se você o informar, a biblioteca o conferirá no Pergamum antes de exibi-lo.</p>
        {draft.people.birthYear && <label className="check check--birth-year"><input required type="checkbox" checked={draft.people.birthYearAcknowledged} onChange={(e) => set("people", { ...draft.people, birthYearAcknowledged: e.target.checked })} /><span>Estou ciente de que o ano informado poderá aparecer na ficha após validação pela biblioteca.</span></label>}
        <label>Título <textarea required minLength={3} maxLength={500} rows={2} value={draft.title} onChange={(e) => set("title", e.target.value)} /></label>
        <p className="field-help">Informe somente o título. Use o campo próprio abaixo quando houver subtítulo.</p>
        <label>Subtítulo <input value={draft.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></label>
        <EquivalentTitlesFields draft={draft} onChange={(equivalentTitles, originalLanguage) => setDraft((current) => ({ ...current, equivalentTitles, originalLanguage }))} />
        <div className="form-row"><label>Nome do orientador <input required minLength={3} value={draft.people.advisor} onChange={(e) => set("people", { ...draft.people, advisor: e.target.value })} /></label><label>Nome do coorientador <input value={draft.people.coadvisor} onChange={(e) => set("people", { ...draft.people, coadvisor: e.target.value })} placeholder="Quando houver" /></label></div>
        <div className="special-cases"><span>Casos especiais, quando aplicáveis</span>{[["cotutelle", "Cotutela", "Regime de orientação compartilhada entre instituições, conforme indicado no trabalho."], ["double_degree", "Dupla titulação", "Trabalho vinculado à obtenção de dois títulos, conforme indicado no trabalho."]].map(([value, label, help]) => <label className="check special-case-label" key={value}><input type="checkbox" checked={draft.specialCases.includes(value)} onChange={(e) => set("specialCases", e.target.checked ? [...draft.specialCases, value] : draft.specialCases.filter((item) => item !== value))} /><span>{label}</span><span className="tooltip" tabIndex={0} aria-label={`Sobre ${label}`}>i<span role="tooltip">{help}</span></span></label>)}</div>
        <div className="form-row"><label>Ano de depósito da versão final <input required type="number" min="1900" max="9999" value={draft.depositYear} onChange={(e) => set("depositYear", e.target.value)} /></label><label>Ano de defesa ou apresentação <input required type="number" min="1900" max={draft.depositYear || "9999"} value={draft.defenseYear} onChange={(e) => set("defenseYear", e.target.value)} /></label></div>
        <div className="form-row">
          {isMpCecre ? <label>Quantidade de volumes <select required value={draft.extentCount} onChange={(e) => set("extentCount", e.target.value)}><option value="2">2 volumes</option><option value="3">3 volumes</option></select></label> : <label>Quantidade total de páginas <input required type="number" min="1" max="99999" value={draft.extentCount} onChange={(e) => set("extentCount", e.target.value)} /></label>}
          <label>O trabalho possui ilustrações? <select required value={draft.hasIllustrations} onChange={(e) => set("hasIllustrations", e.target.value as "" | "yes" | "no")}><option value="">Selecione</option><option value="yes">Sim</option><option value="no">Não</option></select></label>
        </div>
      </fieldset>

      <fieldset className="form-section form-step form-step--3">
        <legend className="sr-only">Palavras-chave</legend>
        <p className="form-section__intro">Todas as informações devem corresponder exatamente ao que está escrito no próprio trabalho.</p>
        <DynamicFields label="Palavra-chave em português" requiredCount={3} values={draft.keywordsPt} onChange={(i, v) => setListItem("keywordsPt", i, v)} onAdd={() => addListItem("keywordsPt")} onRemove={(i) => removeListItem("keywordsPt", i)} />
        <DynamicFields label={draft.originalLanguage === "pt" ? "Keyword em inglês" : `Palavra-chave em ${languageLabels[draft.originalLanguage]}`} requiredCount={3} values={draft.keywordsEn} onChange={(i, v) => setListItem("keywordsEn", i, v)} onAdd={() => addListItem("keywordsEn")} onRemove={(i) => removeListItem("keywordsEn", i)} />
      </fieldset>

      <fieldset className="form-section form-step form-step--4">
        <legend className="sr-only">Arquivo e declarações</legend>
        <label>Link público do trabalho completo <span className="label-with-tooltip"> <input required type="url" pattern="https://.*" value={draft.publicWorkUrl} onChange={(e) => set("publicWorkUrl", e.target.value)} placeholder="https://..." /><span className="tooltip" tabIndex={0} aria-label="Como criar um link público">i<span role="tooltip">Google Drive: Compartilhar → Acesso geral → Qualquer pessoa com o link. OneDrive: Compartilhar → Qualquer pessoa com o link → Pode visualizar. Em outros serviços, escolha acesso público para quem tiver o link.</span></span></span></label>
        <p className="field-help">São aceitos links do Google Drive, OneDrive e serviços similares. Teste-o em uma janela anônima; o Pronto! não armazena o PDF.</p>
        <div className="declarations">
          <label className="check"><input required type="checkbox" checked={draft.defendedAndApproved} onChange={(e) => set("defendedAndApproved", e.target.checked)} /> Declaro que o trabalho foi defendido e aprovado por banca.</label>
          <label className="check"><input required type="checkbox" checked={draft.finalFileConfirmed} onChange={(e) => set("finalFileConfirmed", e.target.checked)} /> Confirmo que este é o arquivo completo e finalizado.</label>
          <label className="check"><input required type="checkbox" checked={draft.approvalPageConfirmed} onChange={(e) => set("approvalPageConfirmed", e.target.checked)} /> Confirmo que o arquivo contém a folha de aprovação assinada ou digitalizada.</label>
        </div>
        <label>Observação para a biblioteca <textarea maxLength={2000} rows={4} value={draft.libraryNote} onChange={(e) => set("libraryNote", e.target.value)} placeholder="Opcional" /></label>
      </fieldset>

      <section className="form-section form-step form-step--5 review-panel" aria-label="Revisão antes do envio"><h2>Revise seus dados</h2><p>Confira as informações antes de enviar. Você poderá voltar a qualquer aba para corrigi-las.</p><dl><div><dt>Título</dt><dd>{draft.title || "Não informado"}{draft.subtitle ? `: ${draft.subtitle}` : ""}</dd></div><div><dt>Idioma original</dt><dd>{languageLabels[draft.originalLanguage]}</dd></div><div><dt>Títulos equivalentes</dt><dd>{draft.equivalentTitles.filter((item) => item.title).map((item) => `${languageLabels[item.language]}: ${item.title}`).join(" · ") || "Não informado"}</dd></div><div><dt>Link público</dt><dd>{draft.publicWorkUrl || "Não informado"}</dd></div></dl></section>
      <div className="form-navigation"><button className="button button--secondary" type="button" disabled={activeStep === 1} onClick={() => setActiveStep((current) => current - 1)}>Voltar</button><div className="draft-status" role="status">{savedAt ? <>Rascunho salvo neste dispositivo às {savedAt}.<br />Você pode continuar depois: seus dados são salvos automaticamente.</> : "Você pode iniciar agora e terminar depois: seus dados são salvos automaticamente neste dispositivo."}</div>{activeStep < 5 ? <button className="button button--primary" type="button" onClick={() => setActiveStep((current) => current + 1)}>Avançar</button> : <button className="button button--primary" type="submit" disabled={submitting}>{submitting ? "Enviando…" : "Enviar solicitação"}</button>}</div>
    </form>
  );
}

function DynamicFields({ label, values, requiredCount = 0, onChange, onAdd, onRemove }: { label: string; values: string[]; requiredCount?: number; onChange: (index: number, value: string) => void; onAdd: () => void; onRemove: (index: number) => void }) {
  return <div className="dynamic-fields"><span>{label}</span>{values.map((value, index) => <div className="dynamic-field" key={index}><input aria-label={`${label} ${index + 1}`} required={index < requiredCount} minLength={index < requiredCount ? 2 : undefined} value={value} onChange={(e) => onChange(index, e.target.value)} />{values.length > requiredCount && <button type="button" className="text-button text-button--remove" onClick={() => onRemove(index)} aria-label={`Remover ${label.toLowerCase()} ${index + 1}`}>Remover</button>}</div>)}<button type="button" className="add-field" onClick={onAdd}>+ Adicionar campo</button></div>;
}

type TitleLanguage = "pt" | "en" | "es" | "de" | "fr" | "it";
const languageLabels: Record<TitleLanguage, string> = { pt: "Português", en: "Inglês", es: "Espanhol", de: "Alemão", fr: "Francês", it: "Italiano" };
function EquivalentTitlesFields({ draft, onChange }: { draft: StudentRequestDraft; onChange: (titles: StudentRequestDraft["equivalentTitles"], originalLanguage: StudentRequestDraft["originalLanguage"]) => void }) {
  const languages: TitleLanguage[] = ["en", "es", "de", "fr", "it"];
  const available = (index: number) => languages.filter((language) => language === draft.equivalentTitles[index]?.language || !draft.equivalentTitles.some((item) => item.language === language));
  const update = (index: number, patch: Partial<StudentRequestDraft["equivalentTitles"][number]>) => onChange(titles.map((item, position) => position === index ? { ...item, ...patch } : item), draft.originalLanguage);
  const isForeign = draft.originalLanguage !== "pt";
  const titles: StudentRequestDraft["equivalentTitles"] = isForeign && !draft.equivalentTitles.some((item) => item.language === "pt") ? [{ language: "pt", title: "" }, ...draft.equivalentTitles] : draft.equivalentTitles;
  const changeOriginalLanguage = (nextLanguage: TitleLanguage) => {
    if (nextLanguage === "pt") {
      const foreignTitles = titles.filter((item) => item.language !== "pt");
      onChange(foreignTitles.length ? foreignTitles : [{ language: "en" as const, title: "" }], nextLanguage);
      return;
    }
    const portuguese: StudentRequestDraft["equivalentTitles"][number] = titles.find((item) => item.language === "pt") ?? { language: "pt", title: "" };
    onChange([portuguese, ...titles.filter((item) => item.language !== "pt" && item.language !== nextLanguage)], nextLanguage);
  };
  return <section className="equivalent-titles"><div className="equivalent-titles__heading"><strong>Títulos equivalentes</strong><p>{isForeign ? "Como o trabalho é originalmente estrangeiro, informe obrigatoriamente o título equivalente em português." : "Informe ao menos um título equivalente em idioma estrangeiro."}</p></div><label>Idioma original do trabalho<select value={draft.originalLanguage} onChange={(event) => changeOriginalLanguage(event.target.value as TitleLanguage)}><option value="pt">Português</option>{languages.map((language) => <option key={language} value={language}>{languageLabels[language]}</option>)}</select></label>{titles.map((item, index) => { const selectable: TitleLanguage[] = isForeign && index === 0 ? ["pt"] : available(index); return <div className="form-row equivalent-title-row" key={`${item.language}-${index}`}><label>Idioma<select value={item.language} disabled={isForeign && index === 0} onChange={(event) => update(index, { language: event.target.value as TitleLanguage })}>{selectable.map((language) => <option key={language} value={language}>{languageLabels[language]}</option>)}</select></label><label>Título equivalente em {languageLabels[item.language]}<input required minLength={3} maxLength={500} value={item.title} onChange={(event) => update(index, { title: event.target.value })} placeholder="Informe título e, quando houver, subtítulo" /></label>{titles.length > 1 && !(isForeign && index === 0) && <button className="text-button text-button--remove" type="button" onClick={() => onChange(titles.filter((_, position) => position !== index), draft.originalLanguage)}>Remover</button>}</div>})}{titles.length < 5 && <button className="add-field" type="button" onClick={() => onChange([...titles, { language: available(titles.length)[0] ?? ("en" as const), title: "" }], draft.originalLanguage)}>+ Adicionar título equivalente</button>}</section>;
}
