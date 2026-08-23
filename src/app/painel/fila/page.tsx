import { redirect } from "next/navigation";
import { StaffQueue } from "@/components/staff-queue";
import { createClient } from "@/lib/supabase/server";
import type { QueueRequest, StaffOption } from "@/domain/staff-queue/types";

type RawQueueRequest = {
  id: string; protocol: string; status: string; title: string; submitted_at: string; assigned_to: string | null;
  assignee: { full_name: string } | { full_name: string }[] | null;
  student: { profile: { full_name: string } | { full_name: string }[] | null } | { profile: { full_name: string } | { full_name: string }[] | null }[] | null;
  enrollment: { program: { id: string; name: string; level: string } | { id: string; name: string; level: string }[] | null } | { program: { id: string; name: string; level: string } | { id: string; name: string; level: string }[] | null }[] | null;
  people: { role: string; transcribed_name: string }[] | null;
  analysis: { internal_note: string }[] | { internal_note: string } | null;
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
      analysis:request_analyses(internal_note)
    `).order("submitted_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name").in("role", ["cataloger", "administrator"]).eq("status", "active").order("full_name"),
  ]);

  const requests: QueueRequest[] = ((data ?? []) as unknown as RawQueueRequest[]).map((item) => {
    const student = first(item.student);
    const enrollment = first(item.enrollment);
    const program = first(enrollment?.program);
    const assignee = first(item.assignee);
    const analysis = first(item.analysis);
    return {
      id: item.id, protocol: item.protocol, status: item.status, title: item.title,
      submittedAt: item.submitted_at, assignedTo: item.assigned_to,
      assigneeName: assignee?.full_name ?? null,
      studentName: first(student?.profile)?.full_name ?? "Estudante",
      programId: program?.id ?? "", programName: program?.name ?? "Programa não identificado",
      level: program?.level ?? "", advisorName: item.people?.find((person) => person.role === "advisor")?.transcribed_name ?? "",
      hasInternalNote: Boolean(analysis?.internal_note.trim()),
    };
  });
  const staff: StaffOption[] = (staffData ?? []).map((item) => ({ id: item.id, fullName: item.full_name }));

  return <main className="dashboard-main dashboard-main--queue"><div className="page-heading queue-heading"><div><p className="eyebrow">Atendimento bibliotecário</p><h1>Fila geral</h1><p>Localize, assuma e acompanhe solicitações sem disputa entre atendentes.</p></div><span className="queue-total"><strong>{requests.filter((item) => !item.assignedTo).length}</strong> aguardando responsável</span></div><StaffQueue initialRequests={requests} staff={staff} currentUserId={user.id} isAdministrator={profile.role === "administrator"} /></main>;
}
