import Link from "next/link";
import { Fragment } from "react";
import { notFound, redirect } from "next/navigation";
import { RequestAnalysisWorkspace, type ReviewField } from "@/components/request-analysis-workspace";
import { RequestAnalysisSections } from "@/components/request-analysis-sections";
import { AssistedCatalogingWorkspace } from "@/components/assisted-cataloging-workspace";
import { NadaConstaReview } from "@/components/nada-consta-review";
import { ProtocolClosure } from "@/components/protocol-closure";
import type { TimelineEvent } from "@/components/request-timeline";
import { ProtocolActionsMenu } from "@/components/protocol-actions-menu";
import { PriorityBadge } from "@/components/priority-badge";
import { AppIcon } from "@/components/app-icon";
import { ProtocolCopyButton } from "@/components/protocol-copy-button";
import { RelativeDateTime } from "@/components/relative-date-time";
import type { CatalogingCardSnapshot } from "@/domain/cataloging-card/types";
import { createClient } from "@/lib/supabase/server";
import { describeRequestProgress } from "@/domain/request-progress";
import { requestStatusIcons, requestStatusKey } from "@/domain/request-status-ui";
import { academicWorkCitation } from "@/domain/citation/academic-work";
import { formatWorkTitle } from "@/lib/work-title";
import { DashboardBreadcrumbProtocol } from "@/components/breadcrumbs";
import { panelRequestMetadata } from "@/lib/panel-metadata";
import { monographDisplayName, programDisplayName } from "@/domain/staff-queue/program-labels";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ origem?: string }> }) {
  return panelRequestMetadata((await params).id, false, (await searchParams).origem);
}

type Program = { code: string; name: string; level: string; work_type: string; cataloging_program_tracing: string | null; coordination_magic_link_enabled: boolean };
type CorrectionBaseline = { field_key: string; original_value: unknown };
type RawDetail = {
  id: string; protocol: string; status: string; title: string; subtitle: string | null; equivalent_title: string | null; equivalent_titles: { language: string; title: string }[]; original_language: string; public_work_url: string; library_note: string | null; assigned_to: string | null; submitted_at: string; updated_at: string;
  student: { profile: { full_name: string } | { full_name: string }[] | null } | { profile: { full_name: string } | { full_name: string }[] | null }[] | null;
  enrollment: { registration_number: string; program: Program | Program[] | null } | { registration_number: string; program: Program | Program[] | null }[] | null;
  people: { role: string; transcribed_name: string; position: number; birth_year: number | null; birth_year_validated_at: string | null }[] | null;
  card_details: { deposit_year: number; defense_year: number; publication_place: string; extent_unit: "pages" | "volumes"; extent_count: number; has_illustrations: boolean; advisor_note_label: string; coadvisor_note_label: string | null; include_equivalent_title: boolean } | { deposit_year: number; defense_year: number; publication_place: string; extent_unit: "pages" | "volumes"; extent_count: number; has_illustrations: boolean; advisor_note_label: string; coadvisor_note_label: string | null; include_equivalent_title: boolean }[] | null;
  keywords: { language: string; term: string; position: number }[] | null;
  analysis: { analysis_notes: string; internal_note: string; updated_at: string; review_completed_at: string | null; student_message_reply: string | null; student_message_reply_sent_at: string | null; declarations_reviewed_at: string | null } | { analysis_notes: string; internal_note: string; updated_at: string; review_completed_at: string | null; student_message_reply: string | null; student_message_reply_sent_at: string | null; declarations_reviewed_at: string | null }[] | null;
  assignee: { full_name: string } | { full_name: string }[] | null;
};
const first = <T,>(value: T | T[] | null | undefined): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;

export default async function RequestAnalysisPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ origem?: string }> }) {
  const { id } = await params;
  const origin = (await searchParams).origem === "meus" ? "meus" : null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (!user || !profile || !["cataloger", "administrator"].includes(profile.role)) redirect("/painel");

  const [{ data }, { data: templates }, { data: authorities }, { data: controlledTerms }, { data: assistedPeople }, { data: selectedTerms }, { data: catalogingMetadata }, { data: nadaConsta }, { data: repositoryProgress }, { data: publication }, { data: timeline }, { data: homologation }, { data: staff }, { data: correctionBaselines }, { data: citationSourceSignature }, { data: citationRecord }, { data: priority }, { data: initialLinkVerified }, { data: activeStaff }] = await Promise.all([
    supabase.from("cataloging_requests").select(`id, protocol, status, title, subtitle, equivalent_title, equivalent_titles, original_language, public_work_url, library_note, assigned_to, submitted_at, updated_at, assignee:profiles!cataloging_requests_assigned_to_fkey(full_name), student:student_profiles!cataloging_requests_student_profile_id_fkey(profile:profiles!student_profiles_profile_id_fkey(full_name)), enrollment:academic_enrollments!cataloging_requests_academic_enrollment_id_fkey(registration_number, program:academic_programs!academic_enrollments_academic_program_id_fkey(code, name, level, work_type, cataloging_program_tracing, coordination_magic_link_enabled)), people:request_people(role, transcribed_name, position, birth_year, birth_year_validated_at), keywords:request_keywords(language, term, position), card_details:request_card_details(deposit_year, defense_year, publication_place, extent_unit, extent_count, has_illustrations, advisor_note_label, coadvisor_note_label, include_equivalent_title), analysis:request_analyses(analysis_notes, internal_note, updated_at, review_completed_at, student_message_reply, student_message_reply_sent_at, declarations_reviewed_at)`).eq("id", id).maybeSingle(),
    supabase.from("issue_templates").select("id, code, label, message").eq("active", true).order("position"),
    supabase.from("person_authorities").select("id, authorized_name").eq("active", true).order("authorized_name").limit(200),
    supabase.from("controlled_terms").select("id, preferred_label_pt, preferred_label_en").eq("active", true).order("preferred_label_pt").limit(300),
    supabase.from("request_cataloging_people").select("authority_person_id, role, transcribed_name, authorized_name_snapshot, position").eq("request_id", id).order("position"),
    supabase.from("request_controlled_terms").select("controlled_term_id, label_pt_snapshot, label_en_snapshot, source_code, is_primary, position").eq("request_id", id).order("position"),
    supabase.from("request_cataloging_metadata").select("cdu_code, cutter_code").eq("request_id", id).maybeSingle(),
    supabase.from("nada_consta_documents").select("id, object_path, original_name, size_bytes, status, rejection_reason, validated_at").eq("request_id", id).order("uploaded_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("repository_deposit_progress").select("started_at").eq("request_id", id).maybeSingle(),
    supabase.from("repository_publications").select("permanent_url,verified_at").eq("request_id", id).maybeSingle(),
    supabase.rpc("request_timeline", { target_request_id: id }),
    supabase.from("cataloging_card_homologations").select("id").eq("request_id", id).maybeSingle(),
    supabase.from("staff_profiles").select("professional_name, crb").eq("profile_id", user.id).maybeSingle(),
    supabase.rpc("list_request_direct_correction_baselines", { target_request_id: id }),
    supabase.rpc("request_citation_source_signature", { target_request_id: id }),
    supabase.from("request_analyses").select("citation_text,citation_source_signature,citation_validated_at").eq("request_id", id).maybeSingle(),
    supabase.from("request_priorities").select("reason_code,reason_detail,marked_at").eq("request_id", id).maybeSingle(),
    supabase.rpc("initial_public_link_verified", { target_request_id: id }),
    supabase.from("profiles").select("id, full_name").in("role", ["cataloger", "administrator"]).eq("status", "active").order("full_name"),
  ]);
  if (!data) notFound();
  const request = data as unknown as RawDetail;
  const student = first(request.student); const enrollment = first(request.enrollment); const program = first(enrollment?.program); const analysis = first(request.analysis); const cardDetails = first(request.card_details);
  const ownsTicket = request.assigned_to === user.id; const editable = ownsTicket && request.status === "in_review";
  const originalPeople = [...(request.people ?? [])].sort((a, b) => a.position - b.position);
  const birth = originalPeople.find((person) => person.role === "author");
  const advisor = originalPeople.find((person) => person.role === "advisor");
  const initialPeople = (assistedPeople?.length ? assistedPeople.map((person) => ({ authorityId: person.authority_person_id, role: person.role, transcribedName: person.transcribed_name, authorizedName: person.authorized_name_snapshot })) : originalPeople.map((person) => ({ authorityId: "", role: person.role, transcribedName: person.transcribed_name, authorizedName: person.transcribed_name }))).map((person) => person.role === "author" ? { ...person, birthYear: birth?.birth_year, birthYearValidated: Boolean(birth?.birth_year_validated_at) } : person);
  const initialTerms = selectedTerms?.length ? selectedTerms.map((term) => ({ termId: term.controlled_term_id, labelPt: term.label_pt_snapshot, labelEn: term.label_en_snapshot ?? "", isPrimary: term.is_primary, sourceCode: term.source_code ?? "" })) : [];
  const reviewFields: ReviewField[] = [
    { key: "title", label: "Título do trabalho", value: request.title, multiline: true }, { key: "subtitle", label: "Subtítulo", value: request.subtitle ?? "" }, { key: "equivalent_title", label: "Título em outro idioma", value: request.equivalent_title ?? "" },
  ];
  const initialCorrectionBaselines = Object.fromEntries(((correctionBaselines ?? []) as CorrectionBaseline[]).map((baseline) => [baseline.field_key, baseline.original_value]));
  const suggestedCitation = program && cardDetails ? academicWorkCitation({ programCode: program.code, authors: originalPeople.filter((person) => person.role === "author").map((person) => person.transcribed_name), title: request.title, subtitle: request.subtitle, depositYear: cardDetails.deposit_year, defenseYear: cardDetails.defense_year, place: cardDetails.publication_place }) : null;
  const previewBase: CatalogingCardSnapshot = { institution: { university: "Universidade Federal da Bahia (UFBA)", librarySystem: "Sistema Universitário de Bibliotecas (SIBI)", library: "Biblioteca da Faculdade de Arquitetura (BIB/FA)" }, request: { protocol: request.protocol, title: request.title, subtitle: request.subtitle, equivalentTitle: request.equivalent_title, includeEquivalentTitle: cardDetails?.include_equivalent_title ?? false, programName: program?.name ?? "", programCode: program?.code ?? "", academicLevel: program?.level ?? "", workNature: program?.work_type === "thesis" ? "Tese" : program?.work_type === "dissertation" ? "Dissertação" : "Trabalho de Conclusão de Curso", programTracing: program?.cataloging_program_tracing, publicationPlace: "Salvador" }, people: [], subjects: [], classification: { cdu: "", cutter: "" }, technicalResponsibility: { name: staff?.professional_name ?? "", crb: staff?.crb ?? "" }, catalogingConventions: { electronicResourceLabel: "[recurso eletrônico]", pageAbbreviation: "p.", volumeAbbreviation: "v.", illustrationAbbreviation: "il.", statementSeparator: "—", academicNoteSeparator: "–", subdivisionSeparator: "-" }, layoutStatus: "institutional_models_validated" };
  const ready = Boolean(homologation && nadaConsta?.status === "approved" && repositoryProgress);

  const progress = describeRequestProgress({ status: request.status, assignedTo: request.assigned_to, nadaConstaStatus: nadaConsta?.status, hasHomologation: Boolean(homologation), hasRepositoryDeposit: Boolean(repositoryProgress), hasPublication: Boolean(publication) });
  const assigneeName = first(request.assignee)?.full_name?.trim();
  const assigneeParts = assigneeName?.split(/\s+/) ?? [];
  const assigneeDisplayName = assigneeParts.length > 1 ? `${assigneeParts[0]} ${assigneeParts[assigneeParts.length - 1]}` : assigneeName;
  const statusKey = requestStatusKey(request.status, progress.tone === "done");
  const finalAction = ownsTicket && request.status === "in_review" ? <section className="panel protocol-next-action" key="review-card-action"><div><p className="eyebrow">Próxima ação do bibliotecário</p><h2>Revisar e homologar a ficha</h2><p>Confira a ficha final, confirme a revisão técnica e homologue. Depois disso, a liberação dependerá apenas do Nada Consta aprovado.</p></div><Link className="button button--primary" href={`/painel/atendimento/${id}/ficha${origin ? "?origem=meus" : ""}`}>Revisar e homologar ficha →</Link></section> : request.status === "approved" && nadaConsta?.status !== "approved" ? <section className="panel protocol-next-action" key="approval-card-action"><div><p className="eyebrow">Próxima ação</p><h2>Aguardar ou validar o Nada Consta</h2><p>A ficha já foi homologada. A liberação ocorrerá automaticamente quando o Nada Consta for aprovado.</p></div></section> : null;
  const equivalentTitles = request.equivalent_titles?.length ? request.equivalent_titles : request.equivalent_title ? [{ language: request.original_language === "en" ? "pt" : "en", title: request.equivalent_title }] : [];
  return <main className="dashboard-main dashboard-main--analysis"><DashboardBreadcrumbProtocol protocol={request.protocol} /><header className={`analysis-case-header queue-status-color--${statusKey}`}>
      <div className="analysis-case-header__top">
        <div className="analysis-case-header__identity"><span className="queue-item__protocol analysis-case-header__protocol"><AppIcon name="document" /><ProtocolCopyButton protocol={request.protocol} showLabel={false} /></span>{assigneeName && <span className="analysis-case-header__assignee" title={assigneeName}><AppIcon name="work" />Responsável técnico: <strong>{assigneeDisplayName}</strong></span>}{priority && <PriorityBadge label="Marcado como prioritário" />}</div>
        <div className="analysis-case-header__actions"><span className={`progress-badge progress-badge--${progress.tone} queue-status-color queue-status-color--${statusKey}`}><AppIcon name={requestStatusIcons[statusKey]} />{progress.label}</span><ProtocolActionsMenu requestId={id} workUrl={initialLinkVerified ? request.public_work_url : null} timelineEvents={(timeline ?? []) as TimelineEvent[]} priorityReasonCode={priority?.reason_code ?? null} priorityReasonDetail={priority?.reason_detail ?? null} canSetPriority={!["completed", "canceled"].includes(request.status)} canRevisit={editable && !analysis?.review_completed_at} canRelease={editable} canReassign={profile.role === "administrator" && !["completed", "canceled"].includes(request.status)} staff={(activeStaff ?? []).map((person) => ({ id: person.id, fullName: person.full_name }))} assignedTo={request.assigned_to} /></div>
      </div>
      <div className="analysis-case-header__title"><h1>{formatWorkTitle(request.title, request.subtitle)}</h1></div>
      {equivalentTitles.length > 0 && <div className="analysis-case-header__equivalents">{equivalentTitles.map((item, index) => <p key={`${item.language}-${index}`}><span>{item.language.toUpperCase()}:</span> {item.title}</p>)}</div>}
      <div className="analysis-case-header__student"><span className="queue-item__student-detail"><AppIcon name="person" /><strong>Solicitante:</strong> {first(student?.profile)?.full_name ?? "Estudante"}</span>{enrollment?.registration_number && <span className="queue-item__student-detail queue-item__registration"><AppIcon name="idCard" /><strong>Matrícula:</strong> {enrollment.registration_number}</span>}</div>
      <dl className="analysis-case-header__details">
        <div><dt><AppIcon name="book" />Programa</dt><dd title={program?.name}>{programDisplayName(program)}</dd></div>
        <div><dt><AppIcon name="document" />Tipo de monografia</dt><dd>{monographDisplayName(program)}</dd></div>
        <div><dt><AppIcon name="person" />Orientador</dt><dd>{advisor?.transcribed_name ?? "Não informado"}</dd></div>
        <div><dt><AppIcon name="calendar" />Solicitado</dt><dd><RelativeDateTime value={request.submitted_at} /></dd></div>
        <div><dt><AppIcon name="review" />Atualizado</dt><dd><RelativeDateTime value={request.updated_at} /></dd></div>
      </dl>
    </header>
    <RequestAnalysisSections declarationRequestId={ownsTicket && !analysis?.review_completed_at && ["in_review", "changes_requested"].includes(request.status) ? id : undefined} declarationsReviewed={Boolean(analysis?.declarations_reviewed_at)} initialLinkVerified={Boolean(initialLinkVerified)} metadataComplete={Boolean(analysis?.review_completed_at)} catalogingComplete={Boolean(homologation)} citationComplete={Boolean(citationRecord?.citation_validated_at && citationRecord.citation_source_signature === citationSourceSignature)} nadaConstaComplete={nadaConsta?.status === "approved"} documentationComplete={request.status === "completed"} publicWorkUrl={request.public_work_url} waitingForStudent={request.status === "changes_requested"} hasStudentMessage={Boolean(request.library_note?.trim())} sharedFileRequestId={ownsTicket && Boolean(analysis?.review_completed_at) && ["in_review", "changes_requested", "approved"].includes(request.status) ? id : undefined} metadata={<RequestAnalysisWorkspace key="metadata" requestId={request.id} initialAnalysisNotes={analysis?.analysis_notes ?? ""} initialInternalNote={analysis?.internal_note ?? ""} initialSavedAt={analysis?.updated_at ?? null} initialReviewCompletedAt={analysis?.review_completed_at ?? null} initialCorrectionBaselines={initialCorrectionBaselines} suggestedCitation={suggestedCitation} initialCitation={citationRecord?.citation_text ?? null} citationValidatedAt={citationRecord?.citation_validated_at ?? null} citationCurrent={Boolean(citationRecord?.citation_validated_at && citationRecord.citation_source_signature === citationSourceSignature)} editable={editable} templates={templates ?? []} fields={reviewFields} studentMessage={request.library_note} initialStudentReply={analysis?.student_message_reply} studentReplySentAt={analysis?.student_message_reply_sent_at} />} cataloging={<AssistedCatalogingWorkspace key="cataloging" requestId={request.id} editable={editable} isRaue={program?.code === "athdc-specialization"} authorities={authorities ?? []} controlledTerms={controlledTerms ?? []} initialPeople={initialPeople} initialTerms={initialTerms} initialCdu={catalogingMetadata?.cdu_code ?? ""} initialCutter={catalogingMetadata?.cutter_code ?? ""} initialCardDetails={{ depositYear: cardDetails?.deposit_year ?? 0, defenseYear: cardDetails?.defense_year ?? 0, extentUnit: cardDetails?.extent_unit ?? "pages", extentCount: cardDetails?.extent_count ?? 0, hasIllustrations: cardDetails?.has_illustrations ?? false, advisorNoteLabel: cardDetails?.advisor_note_label ?? "Orientador", coadvisorNoteLabel: cardDetails?.coadvisor_note_label ?? "Coorientador" }} previewBase={previewBase} submittedKeywords={request.keywords ?? []} />} documentation={<Fragment key="documentation"><NadaConstaReview key="nada-consta" document={nadaConsta} editable={ownsTicket && ["in_review", "approved"].includes(request.status)} />{request.status === "approved" && ownsTicket && <ProtocolClosure key="protocol-closure" requestId={id} ready={ready} />}{publication && <section className="panel publication-record" key="publication-record"><p className="eyebrow">Publicação verificada</p><h2>Protocolo encerrado</h2><a href={publication.permanent_url} target="_blank" rel="noreferrer">{publication.permanent_url} ↗</a><p>O Nada Consta entrou na contagem de 60 dias para expurgo.</p></section>}</Fragment>} finalAction={finalAction} />
  </main>;
}
