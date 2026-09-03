"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CatalogingCardPreview } from "@/components/cataloging-card-preview";
import { AuthorBirthYearValidation } from "@/components/author-birth-year-validation";
import { normalizeCutterCode, type CatalogingCardSnapshot } from "@/domain/cataloging-card/types";

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
  const [draggedTerm, setDraggedTerm] = useState<number | null>(null);
  const [activeAutocomplete, setActiveAutocomplete] = useState<string | null>(null);

  const previewSnapshot = useMemo<CatalogingCardSnapshot>(() => ({
    ...previewBase,
    request: { ...previewBase.request, depositYear: cardDetails.depositYear, defenseYear: cardDetails.defenseYear, extentUnit: cardDetails.extentUnit, extentCount: cardDetails.extentCount, hasIllustrations: cardDetails.hasIllustrations },
    people: people.map((person, position) => ({ ...person, noteLabel: person.role === "advisor" ? cardDetails.advisorNoteLabel : person.role === "coadvisor" ? cardDetails.coadvisorNoteLabel : null, position })),
    subjects: terms.map((term, position) => ({ labelPt: term.labelPt, labelEn: term.labelEn, isPrimary: term.isPrimary, position })),
    classification: { cdu: cduCode, cutter: normalizeCutterCode(cutterCode) },
  }), [previewBase, cardDetails, people, terms, cduCode, cutterCode]);

  const valid = useMemo(() => people.length > 0
    && people.every((person) => person.transcribedName.trim().length >= 3 && person.authorizedName.trim().length >= 3)
    && terms.length > 0 && terms.every((term) => term.labelPt.trim().length >= 2)
    && terms.filter((term) => term.isPrimary).length === 1
    && cardDetails.depositYear >= cardDetails.defenseYear
    && cardDetails.defenseYear >= 1900 && cardDetails.extentCount > 0, [people, terms, cardDetails]);

  useEffect(() => setReady(true), []);
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
  function selectTerm(index: number, labelPt: string) {
    const match = controlledTerms.find((item) => item.preferred_label_pt.toLocaleLowerCase("pt-BR") === labelPt.trim().toLocaleLowerCase("pt-BR"));
    updateTerm(index, { labelPt, labelEn: match?.preferred_label_en ?? terms[index].labelEn, termId: match?.id ?? "" });
  }
  async function suggestCdu() {
    const primary = terms.find((term) => term.isPrimary)?.termId;
    if (!primary) { setSuggestions([]); return; }
    const supabase = createClient();
    const { data } = await supabase.rpc("suggest_cdu", {
      primary_term_id: primary,
      secondary_term_ids: terms.filter((term) => !term.isPrimary && term.termId).map((term) => term.termId),
    });
    setSuggestions((data as Suggestion[] | null) ?? []);
  }

  return <section className="panel assisted-cataloging">
    <div className="assisted-cataloging__heading"><div><p className="eyebrow">Catalogação assistida</p><h2>Pessoas, assuntos e classificação</h2><p>A decisão final permanece com o bibliotecário. O sistema apenas reutiliza registros homologados.</p></div><span className="analysis-workspace__status" role="status">{!editable ? "Somente leitura" : saveState === "saving" ? "Salvando catalogação…" : saveState === "saved" ? "Catalogação salva automaticamente" : saveState === "error" ? "Falha ao salvar a catalogação" : saveState === "incomplete" ? "Complete os campos destacados" : "Salvamento automático ativo"}</span></div>

    <fieldset><legend>Pessoas relacionadas</legend><p className="field-help">A forma transcrita é transposta inicialmente. Ao editar a forma autorizada, as correspondências mais próximas do banco aparecem abaixo.</p><div className="cataloging-list">{people.map((person, index) => <article className="cataloging-row" key={`${person.role}-${index}`}><label>Função<select value={person.role} disabled={!editable} onChange={(event) => updatePerson(index, { role: event.target.value })}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Forma transcrita<input value={person.transcribedName} disabled={!editable} maxLength={300} onChange={(event) => updatePerson(index, { transcribedName: event.target.value, authorizedName: person.authorityId ? person.authorizedName : event.target.value })} /></label><label className="autocomplete-field">Forma autorizada<input value={person.authorizedName} disabled={!editable} maxLength={300} autoComplete="off" onFocus={() => setActiveAutocomplete(`authority-${index}`)} onBlur={() => window.setTimeout(() => setActiveAutocomplete(null), 120)} onChange={(event) => { setActiveAutocomplete(`authority-${index}`); selectAuthority(index, event.target.value); }} />{editable && activeAutocomplete === `authority-${index}` && authorityMatches(person.authorizedName).length > 0 && <span className="cataloging-autocomplete">{authorityMatches(person.authorizedName).map((item) => <button type="button" key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { updatePerson(index, { authorizedName: item.authorized_name, authorityId: item.id }); setActiveAutocomplete(null); }}>{item.authorized_name}</button>)}</span>}</label>{editable && <button className="text-action" type="button" onClick={() => setPeople((current) => current.filter((_, position) => position !== index))}>Remover</button>}</article>)}</div>{editable && <button className="button button--secondary button--small" type="button" onClick={() => setPeople((current) => [...current, { authorityId: "", role: "committee_member", transcribedName: "", authorizedName: "" }])}>Adicionar pessoa</button>}</fieldset>

    <fieldset><legend>Vocabulário controlado bilíngue</legend><p className="field-help">Arraste os termos para reorganizá-los. Marque um como principal para o registro e para as sugestões de CDU.</p><div className="cataloging-list">{terms.map((term, index) => <article className="cataloging-row cataloging-row--term" key={`${term.termId}-${index}`} draggable={editable} onDragStart={() => setDraggedTerm(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedTerm !== null) moveTerm(draggedTerm, index); setDraggedTerm(null); }}><span className="drag-handle" aria-hidden="true">⋮⋮</span><label className="radio-choice"><input type="radio" name="primary-term" checked={term.isPrimary} disabled={!editable} onChange={() => setTerms((current) => current.map((entry, position) => ({ ...entry, isPrimary: position === index })))} /> Termo principal</label><label className="autocomplete-field">Termo preferido — português<input value={term.labelPt} disabled={!editable} maxLength={120} autoComplete="off" onFocus={() => setActiveAutocomplete(`term-${index}`)} onBlur={() => window.setTimeout(() => setActiveAutocomplete(null), 120)} onChange={(event) => { setActiveAutocomplete(`term-${index}`); selectTerm(index, event.target.value); }} />{editable && activeAutocomplete === `term-${index}` && termMatches(term.labelPt).length > 0 && <span className="cataloging-autocomplete">{termMatches(term.labelPt).map((item) => <button type="button" key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { updateTerm(index, { termId: item.id, labelPt: item.preferred_label_pt, labelEn: item.preferred_label_en ?? "" }); setActiveAutocomplete(null); }}>{item.preferred_label_pt}{item.preferred_label_en ? ` — ${item.preferred_label_en}` : ""}</button>)}</span>}</label><label>Equivalente — inglês<input value={term.labelEn} disabled={!editable} maxLength={120} onChange={(event) => updateTerm(index, { labelEn: event.target.value, termId: term.termId })} /></label>{editable && <button className="text-action" type="button" onClick={() => setTerms((current) => { const next = current.filter((_, position) => position !== index); if (term.isPrimary && next[0]) next[0] = { ...next[0], isPrimary: true }; return next; })}>Remover</button>}</article>)}</div>{editable && <button className="button button--secondary button--small" type="button" onClick={() => setTerms((current) => [...current, { termId: "", labelPt: "", labelEn: "", isPrimary: current.length === 0 }])}>Adicionar termo</button>}</fieldset>

    <fieldset><legend>Classificação</legend><div className="classification-grid"><label>CDU — decisão manual<input value={cduCode} disabled={!editable} maxLength={80} onChange={(event) => setCduCode(event.target.value)} placeholder="Preenchimento do bibliotecário" /></label><label>Cutter — sem inicial do título<input value={cutterCode} disabled={!editable} maxLength={40} onChange={(event) => setCutterCode(normalizeCutterCode(event.target.value))} placeholder="Ex.: S237" /></label></div>{editable && <button className="button button--secondary button--small" type="button" onClick={suggestCdu} disabled={!terms.find((term) => term.isPrimary)?.termId}>Sugerir CDU pelo histórico</button>}{suggestions.length > 0 && <div className="cdu-suggestions" aria-label="Sugestões de CDU">{suggestions.map((suggestion) => <button type="button" key={suggestion.cdu_code} onClick={() => setCduCode(suggestion.cdu_code)}><strong>{suggestion.cdu_code}</strong><span>Pontuação {suggestion.score}: {suggestion.primary_count} ficha(s) com o termo principal e {suggestion.secondary_count} ocorrência(s) de termos secundários.</span></button>)}</div>}</fieldset>

    <fieldset><legend>Descrição da ficha</legend><p className="field-help">Confira estes dados na versão final e na página de rosto. A prévia e o PDF usarão exatamente estes valores.</p><div className="classification-grid"><label>Ano de depósito<input type="number" min="1900" max="9999" disabled={!editable} value={cardDetails.depositYear} onChange={(event) => setCardDetails((current) => ({ ...current, depositYear: Number(event.target.value) }))} /></label><label>Ano de defesa<input type="number" min="1900" max={cardDetails.depositYear} disabled={!editable} value={cardDetails.defenseYear} onChange={(event) => setCardDetails((current) => ({ ...current, defenseYear: Number(event.target.value) }))} /></label><label>{cardDetails.extentUnit === "volumes" ? "Quantidade de volumes" : "Quantidade de páginas"}<input type="number" min={cardDetails.extentUnit === "volumes" ? 2 : 1} max={cardDetails.extentUnit === "volumes" ? 3 : 99999} disabled={!editable} value={cardDetails.extentCount} onChange={(event) => setCardDetails((current) => ({ ...current, extentCount: Number(event.target.value) }))} /></label><label className="check"><input type="checkbox" disabled={!editable} checked={cardDetails.hasIllustrations} onChange={(event) => setCardDetails((current) => ({ ...current, hasIllustrations: event.target.checked }))} /> Possui ilustrações (`il.`)</label><label>Designação da orientação<input disabled={!editable} minLength={3} maxLength={60} value={cardDetails.advisorNoteLabel} onChange={(event) => setCardDetails((current) => ({ ...current, advisorNoteLabel: event.target.value }))} /></label><label>Designação da coorientação<input disabled={!editable} minLength={3} maxLength={60} value={cardDetails.coadvisorNoteLabel} onChange={(event) => setCardDetails((current) => ({ ...current, coadvisorNoteLabel: event.target.value }))} /></label></div></fieldset>

    <AuthorBirthYearValidation requestId={requestId} year={people.find((person) => person.role === "author")?.birthYear} validated={people.find((person) => person.role === "author")?.birthYearValidated} editable={editable} onValidated={() => setPeople((current) => current.map((person) => person.role === "author" ? { ...person, birthYearValidated: true } : person))} />
    <CatalogingCardPreview snapshot={previewSnapshot} live />

    <div className="analysis-workspace__actions"><a className="button button--primary" href={`/painel/atendimento/${requestId}/ficha`}>Revisar ficha catalográfica</a></div>
  </section>;
}
