import { redirect } from "next/navigation";
import { StudentRequestForm } from "@/components/student-request-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewStudentRequestPage() {
  const supabase = await createClient();
  const { data: activeRequest } = await supabase.from("cataloging_requests").select("id").in("status", ["submitted", "in_review", "changes_requested", "approved"]).maybeSingle();
  if (activeRequest) redirect("/painel/solicitacao");
  const { data: programs } = await supabase.from("academic_programs").select("id, code, name, level, work_type").eq("active", true).order("name");
  return <main className="dashboard-main dashboard-main--form"><div className="page-heading request-heading"><div><p className="eyebrow">Nova solicitação</p><h1>Dados do trabalho</h1><p>Preencha com atenção. Os dados serão analisados pela biblioteca em uma etapa posterior.</p></div></div><StudentRequestForm programs={programs ?? []} /></main>;
}
