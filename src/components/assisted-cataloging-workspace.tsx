"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { createClient } from "@/lib/supabase/client";
import { CatalogingCardPreview } from "@/components/cataloging-card-preview";
import { AuthorBirthYearValidation } from "@/components/author-birth-year-validation";
import { normalizeCutterCode, type CatalogingCardSnapshot } from "@/domain/cataloging-card/types";
import { A4_PAGE, drawCatalogingCard } from "@/domain/cataloging-card/pdf";
import { authorSurname, findCutterSuggestions } from "@/domain/cutter-suggestions";
import cutterTableJson from "@/data/cutter-sanborn-table.json";

type Authority = { id: string; authorized_name: string };
type ControlledTerm = { id: string; preferred_label_pt: string; preferred_label_en: string | null };
type PersonEntry = { authorityId: string; role: string; transcribedName: string; authorizedName: string; birthYear?: number | null; birthYearValidated?: boolean };
type TermEntry = { termId: string; labelPt: string; labelEn: string; isPrimary: boolean };
type Suggestion = { cdu_code: string; score: number; primary_count: number; secondary_count: number; sheet_count: number };
export type CardDetailsEntry = { depositYear: number; defenseYear: number; extentUnit: "pages" | "volumes"; extentCount: number; hasIllustrations: boolean; advisorNoteLabel: string; coadvisorNoteLabel: string };

const roleLabels: Record<string, string> = {
  author: "Autor", advisor: "Orientador", coadvisor: "Coorientador",
  committee_member: "Membro de banca", related_person: "Outra pessoa relacionada",
};
const cutterTable = cutterTableJson as Record<string, number>;
const similarity = (source: string, candidate: string) => {
  const words = new Set(source.toLocaleLowerCase("pt-BR").replace(/[^\p{L}\p{N}]+/gu, " ").split(/\s+/).filter((word) => word.length > 2));
  return candidate.toLocaleLowerCase("pt-BR").replace(/[^\p{L}\p{N}]+/gu, " ").split(/\s+/).filter((word) => words.has(word)).length;
};

export function AssistedCatalogingWorkspace({ requestId, editable, authorities, controlledTerms, initialPeople, initialTerms, initialCdu, initialCutter, initialCardDetails, previewBase }: {
  requestId: string; editable: boolean; authorities: Authority[]; controlledTerms: ControlledTerm[];
  initialPeople: PersonEntry[]; initialTerms: TermEntry[]; initialCdu: string; initialCutter: string; initialCardDetails: CardDetailsEntry;
  previewBase: CatalogingCardSnapshot;
}) {
  const [people, setPeople] = useState(() => initialPeople.map((person) => {
    if (person.authorityId) return person;
    const closest = [...authorities].sort((a, b) => similarity(person.transcribedName, b.authorized_name) - similarity(person.transcribedName, a.authorized_name))[0];
    return closest && similarity(person.transcribedName, closest.authorized_name) > 0 ? { ...person, authorityId: closest.id, authorizedName: closest.authorized_name } : person;
  }));
  const [terms, setTerms] = useState(() => initialTerms.map((term) => {
    if (term.termId) return term;
    const closest = [...controlledTerms].sort((a, b) => similarity(term.labelPt, b.preferred_label_pt) - similarity(term.labelPt, a.preferred_label_pt))[0];
    return closest && similarity(term.labelPt, closest.preferred_label_pt) > 0 ? { ...term, termId: closest.id, labelPt: closest.preferred_label_pt, labelEn: closest.preferred_label_en ?? term.labelEn } : term;
  }));
  const [cduCode, setCduCode] = useState(initialCdu);
  const [cutterCode, setCutterCode] = useState(initialCutter);
  const [cardDetails, setCardDetails] = useState(initialCardDetails);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error" | "incomplete">("idle");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsChecked, setSuggestionsChecked] = useState(false);
  const [draggedTerm, setDraggedTerm] = useState<number | null>(null);
  const [activeAutocomplete, setActiveAutocomplete] = useState<string | null>(null);
  const [cutterSuggestionsOpen, setCutterSuggestionsOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<Element | null>(null);
  const [openingPreviewPdf, setOpeningPreviewPdf] = useState(false);

  const previewSnapshot = useMemo<CatalogingCardSnapshot>(() => ({
    ...previewBase,
    request: { ...previewBase.request, depositYear: cardDetails.depositYear, defenseYear: cardDetails.defenseYear, extentUnit: cardDetails.extentUnit, extentCount: cardDetails.extentCount, hasIllustrations: cardDetails.hasIllustrations },
    people: people.map((person, position) => ({ ...person, noteLabel: person.role === "advisor" ? cardDetails.advisorNoteLabel : person.role === "coadvisor" ? cardDetails.coadvisorNoteLabel : null, position })),
    subjects: terms.map((term, position) => ({ labelPt: term.labelPt, labelEn: term.labelEn, isPrimary: term.isPrimary, position })),
    classification: { cdu: cduCode, cutter: normalizeCutterCode(cutterCode) },
  }), [previewBase, cardDetails, people, terms, cduCode, cutterCode]);

  const valid = useMemo(() => people.length > 0
    && people.every((person) => person.transcribedName.trim().length >= 3 && person.authorizedName.trim().length >= 3)
    && terms.length >= 3 && terms.every((term) => term.labelPt.trim().length >= 2)
    && terms.filter((term) => term.isPrimary).length === 1
    && cardDetails.depositYear >= cardDetails.defenseYear
    && cardDetails.defenseYear >= 1900 && cardDetails.extentCount > 0, [people, terms, cardDetails]);
  const reviewPendingFields = [
    ...(!previewSnapshot.request.title?.trim() ? [{ tab: "metadata", field: "Título do trabalho", fieldId: "review-field-title" }] : []),
    ...(people.length === 0 ? [{ tab: "cataloging", field: "Pessoas relacionadas (autor e orientador)", fieldId: "cataloging-people" }] : []),
    ...people.flatMap((person) => [
      ...(person.transcribedName.trim().length >= 3 ? [] : [{ tab: "cataloging", field: `Nome como aparece no trabalho — ${roleLabels[person.role] ?? "Pessoa relacionada"}`, fieldId: `cataloging-person-${people.indexOf(person)}` }]),
      ...(person.authorizedName.trim().length >= 3 ? [] : [{ tab: "cataloging", field: `Nome autorizado para a ficha — ${roleLabels[person.role] ?? "Pessoa relacionada"}`, fieldId: `cataloging-person-${people.indexOf(person)}` }]),
    ]),
    ...(terms.length < 3 ? [{ tab: "cataloging", field: "Ao menos três assuntos em português", fieldId: "cataloging-terms" }] : []),
    ...terms.flatMap((term, index) => term.labelPt.trim().length >= 2 ? [] : [{ tab: "cataloging", field: `Assunto em português — termo ${index + 1}`, fieldId: `cataloging-term-${index}` }]),
    ...(terms.length > 0 && terms.filter((term) => term.isPrimary).length !== 1 ? [{ tab: "cataloging", field: "Definição de um único assunto principal", fieldId: "cataloging-terms" }] : []),
    ...(!cduCode.trim() ? [{ tab: "cataloging", field: "CDU escolhida para este trabalho", fieldId: "cataloging-classification" }] : []),
    ...(!normalizeCutterCode(cutterCode) ? [{ tab: "cataloging", field: "Cutter do autor", fieldId: "cataloging-classification" }] : []),
    ...(cardDetails.depositYear < 1900 ? [{ tab: "cataloging", field: "Ano de depósito", fieldId: "cataloging-details" }] : []),
    ...(cardDetails.defenseYear < 1900 ? [{ tab: "cataloging", field: "Ano de defesa", fieldId: "cataloging-details" }] : []),
    ...(cardDetails.depositYear > 0 && cardDetails.defenseYear > cardDetails.depositYear ? [{ tab: "cataloging", field: "Ano de defesa (não pode ser posterior ao depósito)", fieldId: "cataloging-details" }] : []),
    ...(cardDetails.extentCount <= 0 ? [{ tab: "cataloging", field: cardDetails.extentUnit === "volumes" ? "Quantidade de volumes" : "Quantidade de páginas", fieldId: "cataloging-details" }] : []),
  ];
  const reviewChecks = [
    { label: "Título e dados do trabalho", detail: "Título disponível para a ficha", ready: Boolean(previewSnapshot.request.title?.trim()) },
    { label: "Pessoas relacionadas", detail: `${people.length} pessoa(s) com forma autorizada`, ready: people.length > 0 && people.every((person) => person.transcribedName.trim().length >= 3 && person.authorizedName.trim().length >= 3) },
    { label: "Assuntos", detail: `${terms.length} termo(s), com um assunto principal`, ready: terms.length >= 3 && terms.filter((term) => term.isPrimary).length === 1 && terms.every((term) => term.labelPt.trim().length >= 2) },
    { label: "Classificação", detail: "CDU e Cutter definidos", ready: Boolean(cduCode.trim() && normalizeCutterCode(cutterCode)) },
    { label: "Descrição física", detail: "Anos e extensão informados", ready: cardDetails.depositYear >= cardDetails.defenseYear && cardDetails.defenseYear >= 1900 && cardDetails.extentCount > 0 },
  ];
  const readyChecks = reviewChecks.filter((check) => check.ready).length;

  useEffect(() => setReady(true), []);
  useEffect(() => setPreviewTarget(document.getElementById("request-cataloging-preview-end")), []);
  useEffect(() => {
    const fieldsets = document.querySelectorAll<HTMLFieldSetElement>(".assisted-cataloging fieldset");
    const targets = ["cataloging-people", "cataloging-terms", "cataloging-classification", "cataloging-details"];
    fieldsets.forEach((fieldset, index) => { fieldset.id = targets[index] ?? fieldset.id; fieldset.tabIndex = -1; });
    fieldsets[0]?.querySelectorAll<HTMLElement>(".cataloging-row").forEach((row, index) => { row.id = `cataloging-person-${index}`; row.tabIndex = -1; });
    fieldsets[1]?.querySelectorAll<HTMLElement>(".cataloging-row").forEach((row, index) => { row.id = `cataloging-term-${index}`; row.tabIndex = -1; });
  }, [people, terms]);
  useEffect(() => {
    if (!ready || !editable) return;
    if (!valid) { setSaveState("incomplete"); return; }
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      const supabase = createClient();
      const [{ error }, { error: detailsError }] = await Promise.all([
        supabase.rpc("save_assisted_cataloging", { target_request_id: requestId, payload: { people, terms, cduCode, cutterCode } }),
        supabase.rpc("save_request_card_details", { target_request_id: requestId, payload: cardDetails }),
      ]);
      setSaveState(error || detailsError ? "error" : "saved");
    }, 800);
    return () => window.clearTimeout(timer);
  }, [people, terms, cduCode, cutterCode, cardDetails, requestId, editable, ready, valid]);

  function updatePerson(index: number, patch: Partial<PersonEntry>) {
    setPeople((current) => current.map((entry, position) => position === index ? { ...entry, ...patch } : entry));
  }
  function selectAuthority(index: number, authorizedName: string) {
    const match = authorities.find((item) => item.authorized_name.toLocaleLowerCase("pt-BR") === authorizedName.trim().toLocaleLowerCase("pt-BR"));
    updatePerson(index, { authorizedName, authorityId: match?.id ?? "" });
  }
  function updateTerm(index: number, patch: Partial<TermEntry>) {
    setTerms((current) => current.map((entry, position) => {
      if (position !== index) return entry;
      const isManualEnglishEdit = Boolean(entry.termId) && patch.termId === entry.termId && "labelEn" in patch && !("labelPt" in patch);
      return isManualEnglishEdit ? entry : { ...entry, ...patch };
    }));
  }
  function moveTerm(from: number, to: number) {
    if (from === to) return;
    setTerms((current) => { const next = [...current]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); return next; });
  }
  const authorityMatches = (value: string) => value.trim().length < 1 ? [] : authorities.filter((item) => item.authorized_name.toLocaleLowerCase("pt-BR").includes(value.toLocaleLowerCase("pt-BR"))).slice(0, 6);
  const termMatches = (value: string) => value.trim().length < 1 ? [] : controlledTerms.filter((item) => item.preferred_label_pt.toLocaleLowerCase("pt-BR").includes(value.toLocaleLowerCase("pt-BR"))).slice(0, 6);
  const cutterSuggestions = useMemo(() => findCutterSuggestions(cutterTable, people.find((person) => person.role === "author")?.authorizedName ?? ""), [people]);
  const cutterSurname = authorSurname(people.find((person) => person.role === "author")?.authorizedName ?? "");
  function selectTerm(index: number, labelPt: string) {
    const match = controlledTerms.find((item) => item.preferred_label_pt.toLocaleLowerCase("pt-BR") === labelPt.trim().toLocaleLowerCase("pt-BR"));
    updateTerm(index, { labelPt, labelEn: match?.preferred_label_en ?? terms[index].labelEn, termId: match?.id ?? "" });
  }
  async function suggestCdu() {
    setSuggestionsChecked(true);
    const primary = terms.find((term) => term.isPrimary)?.termId;
    if (!primary) { setSuggestions([]); return; }
    const supabase = createClient();
    const { data } = await supabase.rpc("suggest_cdu", {
      primary_term_id: primary,
      secondary_term_ids: terms.filter((term) => !term.isPrimary && term.termId).map((term) => term.termId),
    });
    setSuggestions((data as Suggestion[] | null) ?? []);
  }
  async function openPreviewPdf() {
    setOpeningPreviewPdf(true);
    try {
      const document = await PDFDocument.create();
      const page = document.addPage(A4_PAGE);
      const regular = await document.embedFont(StandardFonts.Helvetica);
      const bold = await document.embedFont(StandardFonts.HelveticaBold);
      drawCatalogingCard(page, previewSnapshot, { regular, bold });
      const bytes = await document.save();
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
      const anchor = window.document.createElement("a");
      anchor.href = url; anchor.target = "_blank"; anchor.rel = "noopener"; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } finally { setOpeningPreviewPdf(false); }
  }

  return <><section className="panel assisted-cataloging">
    <div className="assisted-cataloging__heading"><div><p className="eyebrow">Catalogação assistida</p><h2>Prepare a ficha a partir dos dados conferidos</h2><p>Use as sugestões como apoio. A escolha da forma autorizada, dos assuntos e da classificação é sempre do bibliotecário.</p></div><span className="analysis-workspace__status" role="status">{!editable ? "Somente leitura" : saveState === "saving" ? "Salvando catalogação…" : saveState === "saved" ? "Catalogação salva automaticamente" : saveState === "error" ? "Falha ao salvar a catalogação" : saveState === "incomplete" ? "Preencha os dados obrigatórios para salvar" : "Salvamento automático ativo"}</span></div>

    <fieldset><legend>Pessoas relacionadas</legend><p className="field-help">Compare a forma informada no trabalho com a forma autorizada. Ao digitar no segundo campo, o sistema mostra autoridades já utilizadas.</p><div className="cataloging-list">{people.map((person, index) => <article className="cataloging-row" key={`${person.role}-${index}`}><label>Papel no trabalho<select value={person.role} disabled={!editable} onChange={(event) => updatePerson(index, { role: event.target.value })}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Nome como aparece no trabalho<input value={person.transcribedName} disabled={!editable} maxLength={300} placeholder="Transcreva da folha de rosto" onChange={(event) => updatePerson(index, { transcribedName: event.target.value, authorizedName: person.authorityId ? person.authorizedName : event.target.value })} /></label><label className="autocomplete-field">Nome autorizado para a ficha<input value={person.authorizedName} disabled={!editable} maxLength={300} placeholder="Selecione ou informe a forma autorizada" autoComplete="off" onFocus={() => setActiveAutocomplete(`authority-${index}`)} onBlur={() => window.setTimeout(() => setActiveAutocomplete(null), 120)} onChange={(event) => { setActiveAutocomplete(`authority-${index}`); selectAuthority(index, event.target.value); }} />{editable && activeAutocomplete === `authority-${index}` && authorityMatches(person.authorizedName).length > 0 && <span className="cataloging-autocomplete">{authorityMatches(person.authorizedName).map((item) => <button type="button" key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { updatePerson(index, { authorizedName: item.authorized_name, authorityId: item.id }); setActiveAutocomplete(null); }}>{item.authorized_name}</button>)}</span>}</label>{editable && <button className="text-action" type="button" onClick={() => setPeople((current) => current.filter((_, position) => position !== index))}>Remover</button>}</article>)}</div>{editable && <button className="button button--secondary button--small" type="button" onClick={() => setPeople((current) => [...current, { authorityId: "", role: "committee_member", transcribedName: "", authorizedName: "" }])}>Adicionar pessoa</button>}</fieldset>

    <fieldset><legend>Vocabulário controlado bilíngue</legend><p className="field-help">Arraste os termos para reorganizá-los. Marque um como principal para o registro e para as sugestões de CDU.</p><div className="cataloging-list">{terms.map((term, index) => <article className="cataloging-row cataloging-row--term" key={`${term.termId}-${index}`} draggable={editable} onDragStart={() => setDraggedTerm(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedTerm !== null) moveTerm(draggedTerm, index); setDraggedTerm(null); }}><span className="drag-handle" aria-hidden="true">⋮⋮</span><label className="radio-choice"><input type="radio" name="primary-term" checked={term.isPrimary} disabled={!editable} onChange={() => setTerms((current) => current.map((entry, position) => ({ ...entry, isPrimary: position === index })))} /> Termo principal</label><label className="autocomplete-field">Termo preferido — português<input value={term.labelPt} disabled={!editable} maxLength={120} autoComplete="off" onFocus={() => setActiveAutocomplete(`term-${index}`)} onBlur={() => window.setTimeout(() => setActiveAutocomplete(null), 120)} onChange={(event) => { setActiveAutocomplete(`term-${index}`); selectTerm(index, event.target.value); }} />{editable && activeAutocomplete === `term-${index}` && termMatches(term.labelPt).length > 0 && <span className="cataloging-autocomplete">{termMatches(term.labelPt).map((item) => <button type="button" key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { updateTerm(index, { termId: item.id, labelPt: item.preferred_label_pt, labelEn: item.preferred_label_en ?? "" }); setActiveAutocomplete(null); }}>{item.preferred_label_pt}{item.preferred_label_en ? ` — ${item.preferred_label_en}` : ""}</button>)}</span>}</label><label>Equivalente — inglês<input value={term.labelEn} disabled={!editable} maxLength={120} onChange={(event) => updateTerm(index, { labelEn: event.target.value, termId: term.termId })} /></label>{editable && <button className="text-action" type="button" onClick={() => setTerms((current) => { const next = current.filter((_, position) => position !== index); if (term.isPrimary && next[0]) next[0] = { ...next[0], isPrimary: true }; return next; })}>Remover</button>}</article>)}</div>{editable && <button className="button button--secondary button--small" type="button" onClick={() => setTerms((current) => [...current, { termId: "", labelPt: "", labelEn: "", isPrimary: current.length === 0 }])}>Adicionar termo</button>}</fieldset>

    <fieldset><legend>Classificação</legend><p className="field-help">Defina a CDU e o Cutter. As sugestões vêm de fichas anteriores e não substituem sua decisão técnica.</p><div className="classification-grid"><label>CDU escolhida para este trabalho<input value={cduCode} disabled={!editable} maxLength={80} onChange={(event) => setCduCode(event.target.value)} placeholder="Informe a classificação definida" /></label><label className="autocomplete-field">Cutter do autor (sem inicial do título)<input value={cutterCode} disabled={!editable} maxLength={40} onFocus={() => setCutterSuggestionsOpen(true)} onBlur={() => window.setTimeout(() => setCutterSuggestionsOpen(false), 120)} onChange={(event) => setCutterCode(normalizeCutterCode(event.target.value))} placeholder="Ex.: S237" aria-expanded={cutterSuggestionsOpen && cutterSuggestions.length > 0} aria-controls="cutter-suggestions" />{editable && cutterSuggestionsOpen && cutterSuggestions.length > 0 && <span id="cutter-suggestions" className="cataloging-autocomplete cutter-suggestions" aria-label="Sugestões de Cutter"><small>Para {cutterSurname}</small>{cutterSuggestions.map((suggestion) => <button type="button" key={`${suggestion.prefix}-${suggestion.code}`} onMouseDown={(event) => event.preventDefault()} onClick={() => { setCutterCode(suggestion.code); setCutterSuggestionsOpen(false); }}><strong>{suggestion.code}</strong><span>Prefixo da tabela: {suggestion.prefix}</span></button>)}</span>}</label></div><p className="field-help">As sugestões são atualizadas conforme a forma autorizada do autor é digitada. Escolha uma opção apenas após sua conferência; o Cutter nunca é preenchido automaticamente.</p>{editable && <button className="button button--secondary button--small" type="button" onClick={suggestCdu} disabled={!terms.find((term) => term.isPrimary)?.termId}>Ver sugestões de CDU</button>}{suggestions.length > 0 && <div className="cdu-suggestions" aria-label="Sugestões de CDU"><div className="cdu-suggestions__heading"><strong>Sugestões encontradas</strong><span>Selecione uma sugestão para preencher a CDU. Confira-a antes de manter a classificação.</span></div>{suggestions.map((suggestion) => <button type="button" key={suggestion.cdu_code} onClick={() => setCduCode(suggestion.cdu_code)} aria-label={`Usar a CDU ${suggestion.cdu_code}`}><div><span>CDU sugerida</span><strong>{suggestion.cdu_code}</strong></div><div><p><strong>Assunto principal:</strong> {suggestion.primary_count === 1 ? "1 ficha correspondente" : `${suggestion.primary_count} fichas correspondentes`}. <strong>Assuntos complementares:</strong> {suggestion.secondary_count === 1 ? "1 coincidência no histórico" : `${suggestion.secondary_count} coincidências no histórico`}.</p><em>Usar esta CDU →</em></div></button>)}</div>}{suggestionsChecked && suggestions.length === 0 && <p className="field-help">Nenhuma sugestão foi encontrada para o assunto principal selecionado. Defina a CDU manualmente.</p>}</fieldset>

    <fieldset><legend>Descrição da ficha</legend><p className="field-help">Confira estes dados na versão final e na página de rosto. A prévia e o PDF usarão exatamente estes valores.</p><div className="classification-grid"><label>Ano de depósito<input type="number" min="1900" max="9999" disabled={!editable} value={cardDetails.depositYear} onChange={(event) => setCardDetails((current) => ({ ...current, depositYear: Number(event.target.value) }))} /></label><label>Ano de defesa<input type="number" min="1900" max={cardDetails.depositYear} disabled={!editable} value={cardDetails.defenseYear} onChange={(event) => setCardDetails((current) => ({ ...current, defenseYear: Number(event.target.value) }))} /></label><label>{cardDetails.extentUnit === "volumes" ? "Quantidade de volumes" : "Quantidade de páginas"}<input type="number" min={cardDetails.extentUnit === "volumes" ? 2 : 1} max={cardDetails.extentUnit === "volumes" ? 3 : 99999} disabled={!editable} value={cardDetails.extentCount} onChange={(event) => setCardDetails((current) => ({ ...current, extentCount: Number(event.target.value) }))} /></label><label className="check"><input type="checkbox" disabled={!editable} checked={cardDetails.hasIllustrations} onChange={(event) => setCardDetails((current) => ({ ...current, hasIllustrations: event.target.checked }))} /> Possui ilustrações (`il.`)</label><label>Designação da orientação<input disabled={!editable} minLength={3} maxLength={60} value={cardDetails.advisorNoteLabel} onChange={(event) => setCardDetails((current) => ({ ...current, advisorNoteLabel: event.target.value }))} /></label><label>Designação da coorientação<input disabled={!editable} minLength={3} maxLength={60} value={cardDetails.coadvisorNoteLabel} onChange={(event) => setCardDetails((current) => ({ ...current, coadvisorNoteLabel: event.target.value }))} /></label></div></fieldset>

    <AuthorBirthYearValidation requestId={requestId} year={people.find((person) => person.role === "author")?.birthYear} validated={people.find((person) => person.role === "author")?.birthYearValidated} editable={editable} onValidated={() => setPeople((current) => current.map((person) => person.role === "author" ? { ...person, birthYearValidated: true } : person))} />
  </section>{previewTarget && createPortal(<section className="review-cataloging-preview"><div><p className="eyebrow">Prévia da ficha</p><h2>Confira a ficha antes do encaminhamento</h2><p>Este resumo mostra o que já está pronto para compor a ficha. Revise a prévia abaixo antes de seguir.</p></div><section className="review-cataloging-summary" aria-label="Resumo dos campos da ficha"><div className="review-cataloging-summary__heading"><div><strong>Campos da ficha</strong><span>{readyChecks} de {reviewChecks.length} itens prontos</span></div><span className={reviewPendingFields.length === 0 ? "review-cataloging-summary__status is-ready" : "review-cataloging-summary__status"}>{reviewPendingFields.length === 0 ? "Tudo preenchido" : `${reviewPendingFields.length} pendência(s)`}</span></div><div className="review-cataloging-summary__checks">{reviewChecks.map((check) => <article className={check.ready ? "is-ready" : "is-pending"} key={check.label}><span aria-hidden="true">{check.ready ? "✓" : "!"}</span><div><strong>{check.label}</strong><small>{check.ready ? check.detail : `Pendente: ${check.detail.toLocaleLowerCase("pt-BR")}`}</small></div></article>)}</div>{reviewPendingFields.length > 0 && <div className="review-cataloging-pending"><strong>Complete estes campos antes de homologar a ficha:</strong><ul>{reviewPendingFields.map((item) => <li key={`${item.tab}-${item.field}`}><button type="button" onClick={() => window.dispatchEvent(new CustomEvent("request-analysis:navigate", { detail: item }))}><span>{item.tab === "metadata" ? "Metadados" : "Catalogação"}</span>{item.field}<b aria-hidden="true">→</b></button></li>)}</ul></div>}</section><section className="review-cataloging-preview__sheet"><div className="review-cataloging-preview__sheet-heading"><div><strong>Como ficará no PDF do estudante</strong><span>Prévia para conferência — ainda não homologada</span></div></div><div className="review-cataloging-preview__canvas"><CatalogingCardPreview snapshot={previewSnapshot} /></div></section><div className="analysis-workspace__actions"><button className="button button--secondary" type="button" disabled={openingPreviewPdf} onClick={openPreviewPdf}>{openingPreviewPdf ? "Gerando PDF…" : "Abrir ficha em PDF (prévia do estudante)"}</button></div></section>, previewTarget)}</>;
}
