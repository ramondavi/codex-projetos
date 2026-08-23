import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RequestAnalysisWorkspace } from "@/components/request-analysis-workspace";
import { AssistedCatalogingWorkspace } from "@/components/assisted-cataloging-workspace";
import { NadaConstaReview } from "@/components/nada-consta-review";
import { createClient } from "@/lib/supabase/server";

type RawDetail = {
  id: string; protocol: string; status: string; title: string; subtitle: string | null; equivalent_title: string | null;
  public_work_url: string; library_note: string | null; submitted_at: string; assigned_to: string | null;
  student: { profile: { full_name: string } | { full_name: string }[] | null } | { profile: { full_name: string } | { full_name: string }[] | null }[] | null;
  enrollment: { registration_number: string; program: { name: string; level: string } | { name: string; level: string }[] | null } | { registration_number: string; program: { name: string; level: string } | { name: string; level: string }[] | null }[] | null;
  people: { role: string; transcribed_name: string }[] | null;
  keywords: { language: string; term: string; position: number }[] | null;
  analysis: { analysis_notes: string; internal_note: string } | { analysis_notes: string; internal_note: string }[] | null;
  assignee: { full_name: string } | { full_name: string }[] | null;
};
const first = <T,>(value: T | T[] | null | undefined): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;

export default async function RequestAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (!user || !profile || !["cataloger", "administrator"].includes(profile.role)) redirect("/painel");
  const [{ data }, { data: templates }, { data: authorities }, { data: controlledTerms }, { data: assistedPeople }, { data: selectedTerms }, { data: catalogingMetadata }, { data: nadaConsta }] = await Promise.all([supabase.from("cataloging_requests").select(`
    id, protocol, status, title, subtitle, equivalent_title, public_work_url, library_note, submitted_at, assigned_to,
    assignee:profiles!cataloging_requests_assigned_to_fkey(full_name),
    student:student_profiles!cataloging_requests_student_profile_id_fkey(profile:profiles!student_profiles_profile_id_fkey(full_name)),
    enrollment:academic_enrollments!cataloging_requests_academic_enrollment_id_fkey(registration_number, program:academic_programs!academic_enrollments_academic_program_id_fkey(name, level)),
    people:request_people(role, transcribed_name), keywords:request_keywords(language, term, position),
    analysis:request_analyses(analysis_notes, internal_note)
  `).eq("id", id).maybeSingle(),
  supabase.from("issue_templates").select("id, label, message").eq("active", true).order("position"),
  supabase.from("person_authorities").select("id, authorized_name").eq("active", true).order("authorized_name").limit(200),
  supabase.from("controlled_terms").select("id, preferred_label_pt, preferred_label_en").eq("active", true).order("preferred_label_pt").limit(300),
  supabase.from("request_cataloging_people").select("authority_person_id, role, transcribed_name, authorized_name_snapshot, position").eq("request_id", id).order("position"),
  supabase.from("request_controlled_terms").select("controlled_term_id, label_pt_snapshot, label_en_snapshot, is_primary, position").eq("request_id", id).order("position"),
  supabase.from("request_cataloging_metadata").select("cdu_code, cutter_code").eq("request_id", id).maybeSingle(),
  supabase.from("nada_consta_documents").select("id, object_path, original_name, size_bytes, status, rejection_reason, validated_at").eq("request_id", id).order("uploaded_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!data) notFound();
  const request = data as unknown as RawDetail;
  const student = first(request.student);
  const enrollment = first(request.enrollment);
  const analysis = first(request.analysis);
  const ownsTicket = request.assigned_to === user.id;
  const editable = ownsTicket && request.status === "in_review";
  const originalPeople = request.people ?? [];
  const initialPeople = assistedPeople?.length ? assistedPeople.map((person) => ({ authorityId: person.authority_person_id, role: person.role, transcribedName: person.transcribed_name, authorizedName: person.authorized_name_snapshot })) : originalPeople.map((person) => ({ authorityId: "", role: person.role, transcribedName: person.transcribed_name, authorizedName: person.transcribed_name }));
  const ptKeywords = (request.keywords ?? []).filter((item) => item.language === "pt").sort((a, b) => a.position - b.position);
  const enKeywords = (request.keywords ?? []).filter((item) => item.language === "en").sort((a, b) => a.position - b.position);
  const initialTerms = selectedTerms?.length ? selectedTerms.map((term) => ({ termId: term.controlled_term_id, labelPt: term.label_pt_snapshot, labelEn: term.label_en_snapshot ?? "", isPrimary: term.is_primary })) : ptKeywords.map((term, index) => { const known = controlledTerms?.find((item) => item.preferred_label_pt.toLocaleLowerCase("pt-BR") === term.term.toLocaleLowerCase("pt-BR")); return { termId: known?.id ?? "", labelPt: known?.preferred_label_pt ?? term.term, labelEn: known?.preferred_label_en ?? enKeywords[index]?.term ?? "", isPrimary: index === 0 }; });
  return <main className="dashboard-main dashboard-main--analysis"><Link className="back-link" href="/painel/fila">← Voltar para a fila</Link><div className="page-heading analysis-heading"><div><p className="eyebrow">Atendimento {request.protocol}</p><h1>{request.title}</h1><p>{first(student?.profile)?.full_name ?? "Estudante"} · {first(enrollment?.program)?.name ?? "Programa"}</p></div><span className="request-status">{editable ? "Em edição por você" : ownsTicket ? "Atendimento atribuído a você" : `Bloqueado por ${first(request.assignee)?.full_name ?? "outro profissional"}`}</span></div><div className="analysis-layout"><section className="panel metadata-panel"><p className="eyebrow">Metadados recebidos</p><Metadata label="Matrícula" value={enrollment?.registration_number} /><Metadata label="Título" value={request.title} /><Metadata label="Subtítulo" value={request.subtitle} /><Metadata label="Título equivalente" value={request.equivalent_title} /><Metadata label="Autor" value={request.people?.find((person) => person.role === "author")?.transcribed_name} /><Metadata label="Orientador" value={request.people?.find((person) => person.role === "advisor")?.transcribed_name} /><Metadata label="Coorientador" value={request.people?.find((person) => person.role === "coadvisor")?.transcribed_name} /><Metadata label="Palavras-chave PT" value={request.keywords?.filter((item) => item.language === "pt").map((item) => item.term).join(" · ")} /><Metadata label="Palavras-chave EN" value={request.keywords?.filter((item) => item.language === "en").map((item) => item.term).join(" · ")} /><Metadata label="Observação do estudante" value={request.library_note} /><a className="button button--secondary button--small" href={request.public_work_url} target="_blank" rel="noreferrer">Abrir trabalho completo ↗</a></section><RequestAnalysisWorkspace requestId={request.id} initialAnalysisNotes={analysis?.analysis_notes ?? ""} initialInternalNote={analysis?.internal_note ?? ""} editable={editable} templates={templates ?? []} /></div><AssistedCatalogingWorkspace requestId={request.id} editable={editable} authorities={authorities ?? []} controlledTerms={controlledTerms ?? []} initialPeople={initialPeople} initialTerms={initialTerms} initialCdu={catalogingMetadata?.cdu_code ?? ""} initialCutter={catalogingMetadata?.cutter_code ?? ""} /><NadaConstaReview document={nadaConsta} editable={ownsTicket && request.status === "approved"} /></main>;
}

function Metadata({ label, value }: { label: string; value?: string | null }) {
  return <div className="metadata-row"><span>{label}</span><strong>{value || "—"}</strong></div>;
}
