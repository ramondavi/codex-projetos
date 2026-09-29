import Link from "next/link";
import { redirect } from "next/navigation";
import { FeedbackQuestionnaire } from "@/components/feedback-questionnaire";
import { createClient } from "@/lib/supabase/server";

export default async function FeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (!user || profile?.role !== "student") redirect("/painel");
  const { data: invitations } = await supabase.from("feedback_invitations").select("request_id,invited_at,responded").order("invited_at", { ascending: false });
  const requestIds = (invitations ?? []).map((item) => item.request_id);
  if (!requestIds.length) return <main className="dashboard-main dashboard-main--narrow"><div className="page-heading"><div><p className="eyebrow">Avaliação</p><h1>Sua experiência</h1></div></div><section className="panel"><p>Não há uma avaliação disponível para sua conta.</p><Link className="button button--secondary" href="/painel/solicitacao">Ver minha solicitação</Link></section></main>;
  const { data: requests } = await supabase.from("cataloging_requests").select("id,protocol,status,academic_enrollments(academic_programs(level))").in("id", requestIds);
  const invitation = (invitations ?? []).find((item) => !item.responded);
  const request = (requests ?? []).find((item) => item.id === invitation?.request_id);
  if (!invitation || !request) return <main className="dashboard-main dashboard-main--narrow"><div className="page-heading"><div><p className="eyebrow">Avaliação</p><h1>Obrigado pela sua participação</h1></div></div><section className="feedback-thanks panel"><span aria-hidden="true">✓</span><h2>Suas respostas foram registradas.</h2><p>Elas vão orientar melhorias no Pronto! e nos serviços da BIB/FA.</p><Link className="button button--secondary" href="/painel/solicitacao">Ver minha solicitação</Link></section></main>;
  const enrollment = Array.isArray(request.academic_enrollments) ? request.academic_enrollments[0] : request.academic_enrollments;
  const program = enrollment && (Array.isArray(enrollment.academic_programs) ? enrollment.academic_programs[0] : enrollment.academic_programs);
  return <main className="dashboard-main dashboard-main--narrow"><div className="page-heading"><div><p className="eyebrow">Protocolo concluído</p><h1>Avaliação do atendimento</h1></div></div><FeedbackQuestionnaire requestId={request.id} protocol={request.protocol} postgraduate={Boolean(program && program.level !== "undergraduate")} /></main>;
}
