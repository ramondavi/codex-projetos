import { panelMetadata } from "@/lib/panel-metadata";
export async function generateMetadata() { return panelMetadata("/painel/solicitacao"); }
import { AppIcon } from "@/components/app-icon";
import Link from "next/link";
import { StudentRequestShortcut } from "@/components/student-request-shortcut";
import { StudentDraftSummary } from "@/components/student-request-form";
import { NadaConstaUpload } from "@/components/nada-consta-upload";
import { BrowserPdfDelivery } from "@/components/browser-pdf-delivery";
import type { CatalogingCardSnapshot } from "@/domain/cataloging-card/types";
import { RequestTimeline, type TimelineEvent } from "@/components/request-timeline";
import { RelativeDateTime } from "@/components/relative-date-time";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = { submitted: "Solicitação enviada", in_review: "Em análise", changes_requested: "Correções solicitadas", approved: "Ficha homologada", completed: "Concluída", canceled: "Cancelada" };
type Revision = { id: string; round_number: number; returned_at: string; responded_at: string | null; issues: { field_key: string; field_label: string; justification: string; original_value: unknown }[]; corrections: { field_key: string; corrected_value: unknown; submitted_at: string }[] };

export default async function StudentRequestPage({ searchParams }: { searchParams: Promise<{ enviada?: string; corrigida?: string }> }) {
  const supabase = await createClient();
  const { data: request } = await supabase.from("cataloging_requests").select("id, protocol, status, title, submitted_at, academic_enrollments(registration_number, academic_programs(name, level))").order("submitted_at", { ascending: false }).limit(1).maybeSingle();
  const params = await searchParams;
  const canStart = !request || ["completed", "canceled"].includes(request.status);
  const { data: programs } = canStart ? await supabase.from("academic_programs").select("id,code,name,level,work_type").eq("active", true) : { data: [] };
  if (!request) return <main className="dashboard-main dashboard-main--narrow"><div className="page-heading"><div><h1><AppIcon className="panel-heading-icon" name="request" />Minha solicitação</h1></div></div><section className="panel student-draft-panel"><StudentDraftSummary programs={programs ?? []} emptyMessage="Você ainda não enviou uma solicitação. Comece seu preenchimento abaixo." /><StudentRequestShortcut className="button button--primary" programs={programs ?? []} /></section></main>;
  const enrollment = Array.isArray(request.academic_enrollments) ? request.academic_enrollments[0] : request.academic_enrollments;
  const program = enrollment && (Array.isArray(enrollment.academic_programs) ? enrollment.academic_programs[0] : enrollment.academic_programs);
  const { data: revisionData } = await supabase.from("request_revision_rounds").select("id, round_number, returned_at, responded_at, issues:request_field_issues(field_key, field_label, justification, original_value), corrections:request_corrections(field_key, corrected_value, submitted_at)").eq("request_id", request.id).order("round_number", { ascending: false });
  const { data: nadaConsta } = await supabase.from("nada_consta_documents").select("original_name, size_bytes, status, rejection_reason").eq("request_id", request.id).order("uploaded_at", { ascending: false }).limit(1).maybeSingle();
  const { data: homologation } = await supabase.from("cataloging_card_homologations").select("snapshot").eq("request_id", request.id).maybeSingle();
  const [{data:publication},{data:timeline}]=await Promise.all([supabase.from("repository_publications").select("permanent_url,verified_at").eq("request_id",request.id).maybeSingle(),supabase.rpc("request_timeline",{target_request_id:request.id})]);
  const { data: feedbackInvitation } = request.status === "completed" ? await supabase.from("feedback_invitations").select("request_id,responded").eq("request_id", request.id).maybeSingle() : { data: null };
  const revisions = (revisionData ?? []) as unknown as Revision[];
  return <main className="dashboard-main dashboard-main--narrow">
    {params.enviada === "1" && <div className="auth-feedback auth-feedback--success" role="status">Solicitação enviada com sucesso. Guarde seu protocolo.</div>}
    {params.corrigida === "1" && <div className="auth-feedback auth-feedback--success" role="status">Correções reenviadas. A biblioteca continuará a análise somente dos campos atualizados.</div>}
    <div className="page-heading"><div><h1><AppIcon className="panel-heading-icon" name="request" />Minha solicitação</h1></div><span className="request-status">{request.protocol} · {statusLabels[request.status] ?? request.status}</span></div>
    {canStart && <section className="panel student-draft-panel"><p className="eyebrow">Nova solicitação</p><StudentDraftSummary programs={programs ?? []} /><StudentRequestShortcut className="button button--primary" programs={programs ?? []} /></section>}
    {request.status === "changes_requested" && <section className="pending-action"><div><p className="eyebrow">Sua ação necessária</p><h2>A biblioteca solicitou correções</h2><p>Somente os campos marcados estarão disponíveis para edição.</p></div><Link className="button button--primary" href="/painel/solicitacao/corrigir">Corrigir campos pendentes</Link></section>}
    <section className="panel request-summary"><div><span>Trabalho</span><strong>{request.title}</strong></div><div><span>Curso ou programa</span><strong>{program?.name ?? "—"}</strong></div><div><span>Matrícula deste vínculo</span><strong>{enrollment?.registration_number ?? "—"}</strong></div><div><span>Enviada</span><strong><RelativeDateTime value={request.submitted_at} /></strong></div></section>
    {["submitted", "in_review", "changes_requested", "approved"].includes(request.status) && <NadaConstaUpload requestId={request.id} document={nadaConsta} />}
    {request.status === "approved" && nadaConsta?.status === "approved" && homologation?.snapshot && <BrowserPdfDelivery snapshot={homologation.snapshot as unknown as CatalogingCardSnapshot} />}
    {publication&&<section className="panel publication-record"><p className="eyebrow">Publicação no RI/UFBA</p><h2>Protocolo encerrado</h2><a href={publication.permanent_url} target="_blank" rel="noreferrer">Abrir endereço permanente ↗</a><p>O Nada Consta será expurgado após o prazo de 60 dias; o registro textual da validação será preservado.</p></section>}
    {feedbackInvitation && !feedbackInvitation.responded && <section className="feedback-invite panel"><span aria-hidden="true">✦</span><div><p className="eyebrow">Convite especial</p><h2>Ajude a melhorar o Pronto! e a BIB/FA</h2><p>Você concluiu todas as etapas. Conte como foi sua experiência em cerca de 3 minutos. Sua avaliação não altera o resultado do protocolo.</p></div><Link className="button button--primary" href="/painel/avaliacao">Avaliar minha experiência</Link></section>}
    <RequestTimeline events={(timeline??[]) as TimelineEvent[]}/>
    <section className="revision-history"><p className="eyebrow">Histórico de devoluções e correções</p>{revisions.length === 0 ? <div className="history-empty"><div><h2>Nenhuma devolução</h2></div><p>A biblioteca ainda não solicitou correções neste protocolo.</p></div> : revisions.map((revision) => <article className="revision-card" key={revision.id}><header><strong>Rodada {revision.round_number}</strong><RelativeDateTime value={revision.returned_at} /><span className={revision.responded_at ? "revision-state revision-state--done" : "revision-state"}>{revision.responded_at ? "Correções enviadas" : "Aguardando correção"}</span></header><div>{revision.issues.map((issue) => { const correction = revision.corrections.find((item) => item.field_key === issue.field_key); return <div className="revision-issue" key={issue.field_key}><strong>{issue.field_label}</strong><p>{issue.justification}</p>{correction && <small>Novo valor enviado: {formatValue(correction.corrected_value)}</small>}</div>; })}</div></article>)}</section>
  </main>;
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.join(" · ");
  if (value === null || value === undefined || value === "") return "campo deixado em branco";
  return String(value);
}
