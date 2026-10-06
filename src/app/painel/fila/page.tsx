import { redirect } from "next/navigation";
import { StaffQueue } from "@/components/staff-queue";
import { createClient } from "@/lib/supabase/server";
import type { QueueRequest, StaffOption } from "@/domain/staff-queue/types";
import { describeRequestProgress } from "@/domain/request-progress";
import { panelMetadata } from "@/lib/panel-metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ responsavel?: string }> }) {
  return panelMetadata("/painel/fila", { responsible: (await searchParams).responsavel });
}

type RawQueueRequest = {
  id: string; protocol: string; status: string; title: string; submitted_at: string; assigned_to: string | null;
  assignee: { full_name: string } | { full_name: string }[] | null;
  student: { profile: { full_name: string } | { full_name: string }[] | null } | { profile: { full_name: string } | { full_name: string }[] | null }[] | null;
  enrollment: { program: { id: string; name: string; level: string } | { id: string; name: string; level: string }[] | null } | { program: { id: string; name: string; level: string } | { id: string; name: string; level: string }[] | null }[] | null;
  people: { role: string; transcribed_name: string }[] | null;
  analysis: { internal_note: string }[] | { internal_note: string } | null;
  nadaConsta: { status: string }[] | null;
  homologation: { id: string }[] | null;
  repositoryProgress: { started_at: string }[] | null;
  publication: { verified_at: string }[] | null;
  priority: { request_id: string; reason_code: string; reason_detail: string | null }[] | null;
};

const first = <T,>(value: T | T[] | null | undefined): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;

export default async function StaffQueuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (!user || !profile || !["cataloger", "administrator"].includes(profile.role)) redirect("/painel");

  const [{ data }, { data: staffData }] = await Promise.all([
    supabase.from("cataloging_requests").select(`
      id, protocol, status, title, submitted_at, assigned_to,
      assignee:profiles!cataloging_requests_assigned_to_fkey(full_name),
      student:student_profiles!cataloging_requests_student_profile_id_fkey(
        profile:profiles!student_profiles_profile_id_fkey(full_name)
      ),
      enrollment:academic_enrollments!cataloging_requests_academic_enrollment_id_fkey(
        program:academic_programs!academic_enrollments_academic_program_id_fkey(id, name, level)
      ),
      people:request_people(role, transcribed_name),
      analysis:request_analyses(internal_note),
      nadaConsta:nada_consta_documents(status),
      homologation:cataloging_card_homologations(id),
      repositoryProgress:repository_deposit_progress(started_at),
      publication:repository_publications(verified_at),
      priority:request_priorities(request_id,reason_code,reason_detail)
    `).order("submitted_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name").in("role", ["cataloger", "administrator"]).eq("status", "active").order("full_name"),
  ]);

  const requests: QueueRequest[] = ((data ?? []) as unknown as RawQueueRequest[]).map((item) => {
    const student = first(item.student);
    const enrollment = first(item.enrollment);
    const program = first(enrollment?.program);
    const assignee = first(item.assignee);
    const analysis = first(item.analysis);
    const progress = describeRequestProgress({ status: item.status, assignedTo: item.assigned_to, nadaConstaStatus: first(item.nadaConsta)?.status, hasHomologation: Boolean(first(item.homologation)), hasRepositoryDeposit: Boolean(first(item.repositoryProgress)), hasPublication: Boolean(first(item.publication)) });
    return {
      id: item.id, protocol: item.protocol, status: item.status, title: item.title,
      submittedAt: item.submitted_at, assignedTo: item.assigned_to,
      assigneeName: assignee?.full_name ?? null,
      studentName: first(student?.profile)?.full_name ?? "Estudante",
      programId: program?.id ?? "", programName: program?.name ?? "Programa não identificado",
      level: program?.level ?? "", advisorName: item.people?.find((person) => person.role === "advisor")?.transcribed_name ?? "",
      hasInternalNote: Boolean(analysis?.internal_note.trim()),
      isPriority: Boolean(first(item.priority)),
      priorityReasonCode: first(item.priority)?.reason_code ?? null,
      priorityReasonDetail: first(item.priority)?.reason_detail ?? null,
      progressLabel: progress.label, progressTone: progress.tone,
      progressStep: item.status === "completed" || Boolean(first(item.publication)) ? 4 : item.status === "approved" ? Boolean(first(item.repositoryProgress)) ? 3 : 2 : item.status === "submitted" ? 0 : 1,
    };
  });
  const staff: StaffOption[] = (staffData ?? []).map((item) => ({ id: item.id, fullName: item.full_name }));
  return <main className="dashboard-main dashboard-main--queue"><StaffQueue initialRequests={requests} staff={staff} currentUserId={user.id} isAdministrator={profile.role === "administrator"} /></main>;
}
