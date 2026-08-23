import { redirect } from "next/navigation";
import { StudentCorrectionForm } from "@/components/student-correction-form";
import { correctableFields } from "@/domain/issues/fields";
import { createClient } from "@/lib/supabase/server";

type RawRequest = { id: string; title: string; subtitle: string | null; equivalent_title: string | null; other_titles: string[]; public_work_url: string; volume_information: string | null; library_note: string | null; enrollment: { registration_number: string; academic_program_id: string } | { registration_number: string; academic_program_id: string }[] | null; people: { role: string; transcribed_name: string }[]; keywords: { language: string; term: string; position: number }[] };
const first = <T,>(value: T | T[] | null): T | null => Array.isArray(value) ? value[0] ?? null : value;

export default async function CorrectStudentRequestPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("cataloging_requests").select(`id, title, subtitle, equivalent_title, other_titles, public_work_url, volume_information, library_note, enrollment:academic_enrollments!cataloging_requests_academic_enrollment_id_fkey(registration_number, academic_program_id), people:request_people(role, transcribed_name), keywords:request_keywords(language, term, position)`).eq("status", "changes_requested").maybeSingle();
  if (!data) redirect("/painel/solicitacao");
  const request = data as unknown as RawRequest;
  const { data: revision } = await supabase.from("request_revision_rounds").select("id").eq("request_id", request.id).is("responded_at", null).order("round_number", { ascending: false }).limit(1).maybeSingle();
  if (!revision) redirect("/painel/solicitacao");
  const [{ data: issues }, { data: programs }] = await Promise.all([supabase.from("request_field_issues").select("field_key, field_label, justification").eq("revision_round_id", revision.id).is("resolved_at", null).order("created_at"), supabase.from("academic_programs").select("id, name, level").eq("active", true).order("name")]);
  const enrollment = first(request.enrollment);
  const currentValues: Record<string, string | string[]> = { registration_number: enrollment?.registration_number ?? "", academic_program_id: enrollment?.academic_program_id ?? "", author: request.people.find((item) => item.role === "author")?.transcribed_name ?? "", title: request.title, subtitle: request.subtitle ?? "", equivalent_title: request.equivalent_title ?? "", other_titles: request.other_titles ?? [], advisor: request.people.find((item) => item.role === "advisor")?.transcribed_name ?? "", coadvisor: request.people.find((item) => item.role === "coadvisor")?.transcribed_name ?? "", keywords_pt: request.keywords.filter((item) => item.language === "pt").sort((a, b) => a.position - b.position).map((item) => item.term), keywords_en: request.keywords.filter((item) => item.language === "en").sort((a, b) => a.position - b.position).map((item) => item.term), public_work_url: request.public_work_url, volume_information: request.volume_information ?? "", library_note: request.library_note ?? "" };
  const fields = (issues ?? []).map((issue) => ({ fieldKey: issue.field_key, fieldLabel: issue.field_label, justification: issue.justification, kind: correctableFields.find((field) => field.key === issue.field_key)?.kind ?? "text", value: currentValues[issue.field_key] ?? "" }));
  return <main className="dashboard-main dashboard-main--form"><div className="page-heading request-heading"><div><p className="eyebrow">Correções solicitadas</p><h1>Revise os campos destacados</h1><p>Os demais dados estão bloqueados e serão preservados como aprovados.</p></div></div><StudentCorrectionForm requestId={request.id} fields={fields} programs={programs ?? []} /></main>;
}
