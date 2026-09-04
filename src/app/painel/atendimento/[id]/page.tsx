import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RequestAnalysisWorkspace, type ReviewField } from "@/components/request-analysis-workspace";
import { RequestAnalysisSections } from "@/components/request-analysis-sections";
import { AssistedCatalogingWorkspace } from "@/components/assisted-cataloging-workspace";
import { NadaConstaReview } from "@/components/nada-consta-review";
import { ProtocolClosure } from "@/components/protocol-closure";
import { RequestTimeline, type TimelineEvent } from "@/components/request-timeline";
import type { CatalogingCardSnapshot } from "@/domain/cataloging-card/types";
import { createClient } from "@/lib/supabase/server";

type Program = { name: string; level: string; work_type: string; cataloging_program_tracing: string | null; coordination_magic_link_enabled: boolean };
type RawDetail = {
  id: string; protocol: string; status: string; title: string; subtitle: string | null; equivalent_title: string | null; public_work_url: string; library_note: string | null; assigned_to: string | null; submitted_at: string;
  student: { profile: { full_name: string } | { full_name: string }[] | null } | { profile: { full_name: string } | { full_name: string }[] | null }[] | null;
  enrollment: { registration_number: string; program: Program | Program[] | null } | { registration_number: string; program: Program | Program[] | null }[] | null;
  people: { role: string; transcribed_name: string; birth_year: number | null; birth_year_validated_at: string | null }[] | null;
  card_details: { deposit_year: number; defense_year: number; extent_unit: "pages" | "volumes"; extent_count: number; has_illustrations: boolean; advisor_note_label: string; coadvisor_note_label: string | null } | { deposit_year: number; defense_year: number; extent_unit: "pages" | "volumes"; extent_count: number; has_illustrations: boolean; advisor_note_label: string; coadvisor_note_label: string | null }[] | null;
  keywords: { language: string; term: string; position: number }[] | null;
  analysis: { analysis_notes: string; internal_note: string; updated_at: string; review_completed_at: string | null } | { analysis_notes: string; internal_note: string; updated_at: string; review_completed_at: string | null }[] | null;
  assignee: { full_name: string } | { full_name: string }[] | null;
};
const first = <T,>(value: T | T[] | null | undefined): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;

export default async function RequestAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (!user || !profile || !["cataloger", "administrator"].includes(profile.role)) redirect("/painel");

  const [{ data }, { data: templates }, { data: authorities }, { data: controlledTerms }, { data: assistedPeople }, { data: selectedTerms }, { data: catalogingMetadata }, { data: nadaConsta }, { data: repositoryProgress }, { data: publication }, { data: timeline }, { data: homologation }, { data: staff }] = await Promise.all([
    supabase.from("cataloging_requests").select(`id, protocol, status, title, subtitle, equivalent_title, public_work_url, library_note, assigned_to, submitted_at, assignee:profiles!cataloging_requests_assigned_to_fkey(full_name), student:student_profiles!cataloging_requests_student_profile_id_fkey(profile:profiles!student_profiles_profile_id_fkey(full_name)), enrollment:academic_enrollments!cataloging_requests_academic_enrollment_id_fkey(registration_number, program:academic_programs!academic_enrollments_academic_program_id_fkey(name, level, work_type, cataloging_program_tracing, coordination_magic_link_enabled)), people:request_people(role, transcribed_name, birth_year, birth_year_validated_at), keywords:request_keywords(language, term, position), card_details:request_card_details(deposit_year, defense_year, extent_unit, extent_count, has_illustrations, advisor_note_label, coadvisor_note_label), analysis:request_analyses(analysis_notes, internal_note, updated_at, review_completed_at)`).eq("id", id).maybeSingle(),
    supabase.from("issue_templates").select("id, label, message").eq("active", true).order("position"),
    supabase.from("person_authorities").select("id, authorized_name").eq("active", true).order("authorized_name").limit(200),
    supabase.from("controlled_terms").select("id, preferred_label_pt, preferred_label_en").eq("active", true).order("preferred_label_pt").limit(300),
    supabase.from("request_cataloging_people").select("authority_person_id, role, transcribed_name, authorized_name_snapshot, position").eq("request_id", id).order("position"),
    supabase.from("request_controlled_terms").select("controlled_term_id, label_pt_snapshot, label_en_snapshot, is_primary, position").eq("request_id", id).order("position"),
    supabase.from("request_cataloging_metadata").select("cdu_code, cutter_code").eq("request_id", id).maybeSingle(),
    supabase.from("nada_consta_documents").select("id, object_path, original_name, size_bytes, status, rejection_reason, validated_at").eq("request_id", id).order("uploaded_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("repository_deposit_progress").select("started_at").eq("request_id", id).maybeSingle(),
    supabase.from("repository_publications").select("permanent_url,verified_at").eq("request_id", id).maybeSingle(),
    supabase.rpc("request_timeline", { target_request_id: id }),
    supabase.from("cataloging_card_homologations").select("id").eq("request_id", id).maybeSingle(),
    supabase.from("staff_profiles").select("professional_name, crb").eq("profile_id", user.id).maybeSingle(),
  ]);
  if (!data) notFound();
  const request = data as unknown as RawDetail;
  const student = first(request.student); const enrollment = first(request.enrollment); const program = first(enrollment?.program); const analysis = first(request.analysis); const cardDetails = first(request.card_details);
  const ownsTicket = request.assigned_to === user.id; const editable = ownsTicket && request.status === "in_review";
  const originalPeople = request.people ?? [];
  const birth = originalPeople.find((person) => person.role === "author");
  const initialPeople = (assistedPeople?.length ? assistedPeople.map((person) => ({ authorityId: person.authority_person_id, role: person.role, transcribedName: person.transcribed_name, authorizedName: person.authorized_name_snapshot })) : originalPeople.map((person) => ({ authorityId: "", role: person.role, transcribedName: person.transcribed_name, authorizedName: person.transcribed_name }))).map((person) => person.role === "author" ? { ...person, birthYear: birth?.birth_year, birthYearValidated: Boolean(birth?.birth_year_validated_at) } : person);
  const ptKeywords = (request.keywords ?? []).filter((item) => item.language === "pt").sort((a, b) => a.position - b.position); const enKeywords = (request.keywords ?? []).filter((item) => item.language === "en").sort((a, b) => a.position - b.position);
  const initialTerms = selectedTerms?.length ? selectedTerms.map((term) => ({ termId: term.controlled_term_id, labelPt: term.label_pt_snapshot, labelEn: term.label_en_snapshot ?? "", isPrimary: term.is_primary })) : ptKeywords.map((term, index) => { const known = controlledTerms?.find((item) => item.preferred_label_pt.toLocaleLowerCase("pt-BR") === term.term.toLocaleLowerCase("pt-BR")); return { termId: known?.id ?? "", labelPt: known?.preferred_label_pt ?? term.term, labelEn: known?.preferred_label_en ?? enKeywords[index]?.term ?? "", isPrimary: index === 0 }; });
  const personValue = (role: string) => originalPeople.find((person) => person.role === role)?.transcribed_name ?? "";
  const reviewFields: ReviewField[] = [
    { key: "registration_number", label: "Matrícula do estudante", value: enrollment?.registration_number ?? "" }, { key: "title", label: "Título do trabalho", value: request.title, multiline: true }, { key: "subtitle", label: "Subtítulo", value: request.subtitle ?? "" }, { key: "equivalent_title", label: "Título em outro idioma", value: request.equivalent_title ?? "" }, { key: "author", label: "Autor informado", value: personValue("author") }, { key: "advisor", label: "Orientador informado", value: personValue("advisor") }, { key: "coadvisor", label: "Coorientador informado", value: personValue("coadvisor") }, { key: "keywords_pt", label: "Palavras-chave — português", value: ptKeywords.map((item) => item.term).join("\n"), multiline: true }, { key: "keywords_en", label: "Palavras-chave — inglês", value: enKeywords.map((item) => item.term).join("\n"), multiline: true }, { key: "public_work_url", label: "Link público para a versão final", value: request.public_work_url }, { key: "library_note", label: "Mensagem deixada pelo estudante", value: request.library_note ?? "", multiline: true },
  ];
  const previewBase: CatalogingCardSnapshot = { institution: { university: "Universidade Federal da Bahia (UFBA)", librarySystem: "Sistema Universitário de Bibliotecas (SIBI)", library: "Biblioteca da Faculdade de Arquitetura (BIB/FA)" }, request: { protocol: request.protocol, title: request.title, subtitle: request.subtitle, equivalentTitle: request.equivalent_title, programName: program?.name ?? "", academicLevel: program?.level ?? "", workNature: program?.work_type === "thesis" ? "Tese" : program?.work_type === "dissertation" ? "Dissertação" : "Trabalho de Conclusão de Curso", programTracing: program?.cataloging_program_tracing, publicationPlace: "Salvador" }, people: [], subjects: [], classification: { cdu: "", cutter: "" }, technicalResponsibility: { name: staff?.professional_name ?? "", crb: staff?.crb ?? "" }, catalogingConventions: { electronicResourceLabel: "[recurso eletrônico]", pageAbbreviation: "p.", volumeAbbreviation: "v.", illustrationAbbreviation: "il.", statementSeparator: "—", academicNoteSeparator: "–", subdivisionSeparator: "-" }, layoutStatus: "institutional_models_validated" };
  const ready = Boolean(homologation && nadaConsta?.status === "approved" && repositoryProgress);

  const attendanceStatus = request.status === "completed" ? "Protocolo encerrado" : editable ? "Em edição por você" : ownsTicket ? "Atendimento atribuído a você" : `Bloqueado por ${first(request.assignee)?.full_name ?? "outro profissional"}`;
  const statusClass = request.status === "completed" ? "request-status--done" : editable ? "request-status--active" : "";
  return <main className="dashboard-main dashboard-main--analysis"><Link className="back-link" href="/painel/fila">← Voltar para a fila</Link><header className="analysis-case-header"><div className="analysis-case-header__top"><p className="eyebrow">Atendimento</p><div className="analysis-case-header__actions"><span className={`request-status ${statusClass}`}>{attendanceStatus}</span><a className="button button--primary button--small" href={request.public_work_url} target="_blank" rel="noreferrer">Abrir trabalho completo ↗</a></div></div><div className="analysis-case-header__protocol">Protocolo {request.protocol} <time title={new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.submitted_at))}>· aberto há {Math.max(0, Math.floor((Date.now() - new Date(request.submitted_at).getTime()) / 86400000))} dias</time></div><h1>{request.title}</h1><dl className="analysis-case-header__details"><div><dt>Estudante</dt><dd>{first(student?.profile)?.full_name ?? "Estudante"}</dd></div><div><dt>Curso</dt><dd>{program?.name ?? "Programa não identificado"}</dd></div></dl></header>
    <RequestAnalysisSections metadata={<RequestAnalysisWorkspace requestId={request.id} initialAnalysisNotes={analysis?.analysis_notes ?? ""} initialInternalNote={analysis?.internal_note ?? ""} initialSavedAt={analysis?.updated_at ?? null} initialReviewCompletedAt={analysis?.review_completed_at ?? null} editable={editable} templates={templates ?? []} fields={reviewFields} />} cataloging={<AssistedCatalogingWorkspace requestId={request.id} editable={editable} authorities={authorities ?? []} controlledTerms={controlledTerms ?? []} initialPeople={initialPeople} initialTerms={initialTerms} initialCdu={catalogingMetadata?.cdu_code ?? ""} initialCutter={catalogingMetadata?.cutter_code ?? ""} initialCardDetails={{ depositYear: cardDetails?.deposit_year ?? 0, defenseYear: cardDetails?.defense_year ?? 0, extentUnit: cardDetails?.extent_unit ?? "pages", extentCount: cardDetails?.extent_count ?? 0, hasIllustrations: cardDetails?.has_illustrations ?? false, advisorNoteLabel: cardDetails?.advisor_note_label ?? "Orientador", coadvisorNoteLabel: cardDetails?.coadvisor_note_label ?? "Coorientador" }} previewBase={previewBase} />} documentation={<><NadaConstaReview document={nadaConsta} editable={ownsTicket && request.status === "approved"} />{request.status === "approved" && ownsTicket && <ProtocolClosure requestId={id} coordinationEnabled={program?.coordination_magic_link_enabled ?? false} ready={ready} />}{publication && <section className="panel publication-record"><p className="eyebrow">Publicação verificada</p><h2>Protocolo encerrado</h2><a href={publication.permanent_url} target="_blank" rel="noreferrer">{publication.permanent_url} ↗</a><p>O Nada Consta entrou na contagem de 60 dias para expurgo.</p></section>}<RequestTimeline events={(timeline ?? []) as TimelineEvent[]} /></>} />
  </main>;
}

