import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = { submitted: "Solicitação enviada", in_review: "Em análise", changes_requested: "Correções solicitadas", approved: "Ficha homologada", completed: "Concluída", canceled: "Cancelada" };

export default async function StudentRequestPage({ searchParams }: { searchParams: Promise<{ enviada?: string }> }) {
  const supabase = await createClient();
  const { data: request } = await supabase.from("cataloging_requests").select("protocol, status, title, submitted_at, academic_enrollments(registration_number, academic_programs(name, level))").order("submitted_at", { ascending: false }).limit(1).maybeSingle();
  const params = await searchParams;
  if (!request) return <main className="dashboard-main dashboard-main--narrow"><div className="page-heading"><div><p className="eyebrow">Minha solicitação</p><h1>Nenhum protocolo</h1></div></div><section className="panel"><p>Você ainda não abriu uma solicitação.</p><Link className="button button--primary" href="/painel/solicitacao/nova">Iniciar solicitação</Link></section></main>;
  const enrollment = Array.isArray(request.academic_enrollments) ? request.academic_enrollments[0] : request.academic_enrollments;
  const program = enrollment && (Array.isArray(enrollment.academic_programs) ? enrollment.academic_programs[0] : enrollment.academic_programs);
  return <main className="dashboard-main dashboard-main--narrow">{params.enviada === "1" && <div className="auth-feedback auth-feedback--success" role="status">Solicitação enviada com sucesso. Guarde seu protocolo.</div>}<div className="page-heading"><div><p className="eyebrow">Minha solicitação</p><h1>{request.protocol}</h1></div><span className="request-status">{statusLabels[request.status] ?? request.status}</span></div><section className="panel request-summary"><div><span>Trabalho</span><strong>{request.title}</strong></div><div><span>Curso ou programa</span><strong>{program?.name ?? "—"}</strong></div><div><span>Matrícula deste vínculo</span><strong>{enrollment?.registration_number ?? "—"}</strong></div><div><span>Enviada em</span><strong>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date(request.submitted_at))}</strong></div></section><section className="panel panel--institutional"><strong>Próxima etapa</strong><p>Seu protocolo está registrado. O atendimento bibliotecário ainda não faz parte deste incremento.</p></section></main>;
}
