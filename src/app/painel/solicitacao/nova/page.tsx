import { panelMetadata } from "@/lib/panel-metadata";
export async function generateMetadata() { return panelMetadata("/painel/solicitacao/nova"); }
import { AppIcon } from "@/components/app-icon";
import { redirect } from "next/navigation";
import { StudentRequestForm } from "@/components/student-request-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewStudentRequestPage({ searchParams }: { searchParams: Promise<{ revisao?: string }> }) {
  const { revisao } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: activeRequest } = await supabase.from("cataloging_requests").select("id").in("status", ["submitted", "in_review", "changes_requested", "approved"]).maybeSingle();
  if (activeRequest) redirect("/painel/solicitacao");
  const { data: student } = await supabase.from("student_profiles").select("birth_date").eq("profile_id", user.id).maybeSingle();
  if (!student?.birth_date) redirect("/painel/conta?error=Informe%20sua%20data%20de%20nascimento%20antes%20de%20abrir%20uma%20solicita%C3%A7%C3%A3o.");
  const { data: programs } = await supabase.from("academic_programs").select("id, code, name, level, work_type").eq("active", true).order("name");
  return <main className="dashboard-main dashboard-main--form"><div className="page-heading request-heading"><div><h1><AppIcon className="panel-heading-icon" name="document" />Nova solicitação</h1></div></div><StudentRequestForm programs={programs ?? []} openReview={revisao === "1"} /></main>;
}
