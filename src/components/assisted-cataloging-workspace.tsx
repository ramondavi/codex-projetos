"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Authority = { id: string; authorized_name: string };
type ControlledTerm = { id: string; preferred_label_pt: string; preferred_label_en: string | null };
type PersonEntry = { authorityId: string; role: string; transcribedName: string; authorizedName: string };
type TermEntry = { termId: string; labelPt: string; labelEn: string; isPrimary: boolean };
type Suggestion = { cdu_code: string; score: number; primary_count: number; secondary_count: number; sheet_count: number };
export type CardDetailsEntry = { depositYear: number; defenseYear: number; extentUnit: "pages" | "volumes"; extentCount: number; hasIllustrations: boolean; advisorNoteLabel: string; coadvisorNoteLabel: string };

const roleLabels: Record<string, string> = {
  author: "Autor", advisor: "Orientador", coadvisor: "Coorientador",
  committee_member: "Membro de banca", related_person: "Outra pessoa relacionada",
};

export function AssistedCatalogingWorkspace({ requestId, editable, authorities, controlledTerms, initialPeople, initialTerms, initialCdu, initialCutter, initialCardDetails }: {
  requestId: string; editable: boolean; authorities: Authority[]; controlledTerms: ControlledTerm[];
  initialPeople: PersonEntry[]; initialTerms: TermEntry[]; initialCdu: string; initialCutter: string; initialCardDetails: CardDetailsEntry;
}) {
  const [people, setPeople] = useState(initialPeople);
  const [terms, setTerms] = useState(initialTerms);
  const [cduCode, setCduCode] = useState(initialCdu);
  const [cutterCode, setCutterCode] = useState(initialCutter);
  const [cardDetails, setCardDetails] = useState(initialCardDetails);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error" | "incomplete">("idle");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

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
    setTerms((current) => current.map((entry, position) => position === index ? { ...entry, ...patch } : entry));
  }
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

    <fieldset><legend>Pessoas relacionadas</legend><p className="field-help">A forma transcrita reproduz a folha de rosto; a autorizada será usada nas entradas da ficha.</p><datalist id="person-authorities">{authorities.map((item) => <option key={item.id} value={item.authorized_name} />)}</datalist><div className="cataloging-list">{people.map((person, index) => <article className="cataloging-row" key={`${person.role}-${index}`}><label>Função<select value={person.role} disabled={!editable} onChange={(event) => updatePerson(index, { role: event.target.value })}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Forma transcrita<input value={person.transcribedName} disabled={!editable} maxLength={300} onChange={(event) => updatePerson(index, { transcribedName: event.target.value })} /></label><label>Forma autorizada<input list="person-authorities" value={person.authorizedName} disabled={!editable} maxLength={300} onChange={(event) => selectAuthority(index, event.target.value)} /></label>{editable && <button className="text-action" type="button" onClick={() => setPeople((current) => current.filter((_, position) => position !== index))}>Remover</button>}</article>)}</div>{editable && <button className="button button--secondary button--small" type="button" onClick={() => setPeople((current) => [...current, { authorityId: "", role: "committee_member", transcribedName: "", authorizedName: "" }])}>Adicionar pessoa</button>}</fieldset>

    <fieldset><legend>Vocabulário controlado bilíngue</legend><p className="field-help">O termo em português será usado na ficha; o equivalente em inglês fica preparado para reutilização.</p><datalist id="controlled-terms">{controlledTerms.map((term) => <option key={term.id} value={term.preferred_label_pt}>{term.preferred_label_en ?? "Sem equivalente em inglês"}</option>)}</datalist><div className="cataloging-list">{terms.map((term, index) => <article className="cataloging-row cataloging-row--term" key={index}><label className="radio-choice"><input type="radio" name="primary-term" checked={term.isPrimary} disabled={!editable} onChange={() => setTerms((current) => current.map((entry, position) => ({ ...entry, isPrimary: position === index })))} /> Termo principal</label><label>Termo preferido — português<input list="controlled-terms" value={term.labelPt} disabled={!editable} maxLength={120} onChange={(event) => selectTerm(index, event.target.value)} /></label><label>Equivalente — inglês<input value={term.labelEn} disabled={!editable} maxLength={120} onChange={(event) => updateTerm(index, { labelEn: event.target.value, termId: term.termId })} /></label>{editable && <button className="text-action" type="button" onClick={() => setTerms((current) => { const next = current.filter((_, position) => position !== index); if (term.isPrimary && next[0]) next[0] = { ...next[0], isPrimary: true }; return next; })}>Remover</button>}</article>)}</div>{editable && <button className="button button--secondary button--small" type="button" onClick={() => setTerms((current) => [...current, { termId: "", labelPt: "", labelEn: "", isPrimary: current.length === 0 }])}>Adicionar termo</button>}</fieldset>

    <fieldset><legend>Classificação</legend><div className="classification-grid"><label>CDU — decisão manual<input value={cduCode} disabled={!editable} maxLength={80} onChange={(event) => setCduCode(event.target.value)} placeholder="Preenchimento do bibliotecário" /></label><label>Cutter — manual<input value={cutterCode} disabled={!editable} maxLength={40} onChange={(event) => setCutterCode(event.target.value)} placeholder="Sem sugestão até validar a tabela" /></label></div>{editable && <button className="button button--secondary button--small" type="button" onClick={suggestCdu} disabled={!terms.find((term) => term.isPrimary)?.termId}>Sugerir CDU pelo histórico</button>}{suggestions.length > 0 && <div className="cdu-suggestions" aria-label="Sugestões de CDU">{suggestions.map((suggestion) => <button type="button" key={suggestion.cdu_code} onClick={() => setCduCode(suggestion.cdu_code)}><strong>{suggestion.cdu_code}</strong><span>Pontuação {suggestion.score}: {suggestion.primary_count} ficha(s) com o termo principal e {suggestion.secondary_count} ocorrência(s) de termos secundários.</span></button>)}</div>}</fieldset>

    <fieldset><legend>Descrição da ficha</legend><p className="field-help">Confira estes dados na versão final e na página de rosto. A prévia e o PDF usarão exatamente estes valores.</p><div className="classification-grid"><label>Ano de depósito<input type="number" min="1900" max="9999" disabled={!editable} value={cardDetails.depositYear} onChange={(event) => setCardDetails((current) => ({ ...current, depositYear: Number(event.target.value) }))} /></label><label>Ano de defesa<input type="number" min="1900" max={cardDetails.depositYear} disabled={!editable} value={cardDetails.defenseYear} onChange={(event) => setCardDetails((current) => ({ ...current, defenseYear: Number(event.target.value) }))} /></label><label>{cardDetails.extentUnit === "volumes" ? "Quantidade de volumes" : "Quantidade de páginas"}<input type="number" min={cardDetails.extentUnit === "volumes" ? 2 : 1} max={cardDetails.extentUnit === "volumes" ? 3 : 99999} disabled={!editable} value={cardDetails.extentCount} onChange={(event) => setCardDetails((current) => ({ ...current, extentCount: Number(event.target.value) }))} /></label><label className="check"><input type="checkbox" disabled={!editable} checked={cardDetails.hasIllustrations} onChange={(event) => setCardDetails((current) => ({ ...current, hasIllustrations: event.target.checked }))} /> Possui ilustrações (`il.`)</label><label>Designação da orientação<select disabled={!editable} value={cardDetails.advisorNoteLabel} onChange={(event) => setCardDetails((current) => ({ ...current, advisorNoteLabel: event.target.value }))}><option>Orientador</option><option>Orientadora</option></select></label><label>Designação da coorientação<select disabled={!editable} value={cardDetails.coadvisorNoteLabel} onChange={(event) => setCardDetails((current) => ({ ...current, coadvisorNoteLabel: event.target.value }))}><option>Coorientador</option><option>Coorientadora</option></select></label></div></fieldset>

    <div className="marc-preparation"><strong>Preparação para futuro MARC 21</strong><p>As autoridades, assuntos bilíngues, CDU e Cutter são salvos separadamente e em um retrato estruturado. Nenhuma exportação MARC é feita neste incremento.</p></div>
    <div className="analysis-workspace__actions"><a className="button button--primary" href={`/painel/atendimento/${requestId}/ficha`}>Revisar ficha catalográfica</a></div>
  </section>;
}
