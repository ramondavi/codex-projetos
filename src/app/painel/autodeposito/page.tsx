import { redirect } from "next/navigation";
import { RepositoryDepositGuide, type RepositoryCopyField } from "@/components/repository-deposit-guide";
import type { CatalogingCardSnapshot } from "@/domain/cataloging-card/types";
import { createClient } from "@/lib/supabase/server";

const first = <T,>(value: T | T[] | null | undefined): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;

export default async function RepositoryDepositPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (!user || profile?.role !== "student") redirect("/painel");
  const { data: request } = await supabase.from("cataloging_requests").select(`id,status,title,subtitle,equivalent_title,people:request_people(role,transcribed_name,authorized_name,position),keywords:request_keywords(language,term,position),enrollment:academic_enrollments!cataloging_requests_academic_enrollment_id_fkey(program:academic_programs!academic_enrollments_academic_program_id_fkey(id,name,level,repository_deposit_enabled,repository_collection_label,repository_document_type_label,repository_academic_degree_label,repository_institution_label,repository_institution_acronym,repository_unit_label,repository_program_label,repository_country_label,repository_default_language_label))`).order("submitted_at", { ascending: false }).limit(1).maybeSingle();
  if (!request) return <main className="dashboard-main dashboard-main--narrow"><div className="page-heading"><div><p className="eyebrow">Autodepósito</p><h1>Sem solicitação</h1></div></div><section className="panel"><p>Abra e conclua uma solicitação antes de acessar este guia.</p></section></main>;
  const enrollment = first(request.enrollment); const program = first(enrollment?.program);
  const [{ data: nada }, { data: homologation }, { data: progress }] = await Promise.all([
    supabase.from("nada_consta_documents").select("status").eq("request_id", request.id).eq("status", "approved").maybeSingle(),
    supabase.from("cataloging_card_homologations").select("snapshot").eq("request_id", request.id).maybeSingle(),
    supabase.from("repository_deposit_progress").select("started_at").eq("request_id", request.id).maybeSingle(),
  ]);
  const available = request.status === "approved" && nada?.status === "approved" && Boolean(homologation?.snapshot);
  if (!program?.repository_deposit_enabled) return <main className="dashboard-main dashboard-main--narrow"><div className="page-heading"><div><p className="eyebrow">Autodepósito no RI/UFBA</p><h1>Guia desativado</h1></div></div><section className="panel panel--institutional"><h2>{program?.name ?? "Seu curso ou programa"}</h2><p>O guia de autodepósito não está habilitado para este vínculo. Para TFG de graduação, ele permanece inicialmente desativado por cautela normativa.</p></section></main>;
  if (!available) return <main className="dashboard-main dashboard-main--narrow"><div className="page-heading"><div><p className="eyebrow">Autodepósito no RI/UFBA</p><h1>Aguarde a liberação</h1></div></div><section className="panel"><p>O guia será liberado após a homologação da ficha e a validação do Nada Consta.</p></section></main>;
  const snapshot = homologation!.snapshot as unknown as CatalogingCardSnapshot;
  const people = [...snapshot.people].sort((a,b) => (a.position ?? 0)-(b.position ?? 0));
  const person = (role: string) => people.filter((item) => item.role === role).map((item) => item.authorizedName || item.transcribedName).join("; ");
  const keyword = (language: string) => (request.keywords ?? []).filter((item) => item.language === language).sort((a,b) => a.position-b.position).map((item) => item.term).join("; ");
  const fields: RepositoryCopyField[] = [
    { label: "Coleção", value: program.repository_collection_label }, { label: "Tipo de documento", value: program.repository_document_type_label }, { label: "Grau acadêmico", value: program.repository_academic_degree_label },
    { label: "Título e subtítulo", value: [snapshot.request.title, snapshot.request.subtitle].filter(Boolean).join(": ") }, { label: "Título equivalente", value: snapshot.request.equivalentTitle },
    { label: "Autor", value: person("author") }, { label: "Primeiro orientador", value: person("advisor") }, { label: "Coorientador", value: person("coadvisor") },
    { label: "Nome da instituição", value: program.repository_institution_label }, { label: "Sigla da instituição", value: program.repository_institution_acronym }, { label: "Faculdade, instituto ou departamento", value: program.repository_unit_label },
    { label: program.level === "undergraduate" ? "Nome do curso" : "Nome do programa de pós-graduação", value: program.repository_program_label || program.name }, { label: "País", value: program.repository_country_label }, { label: "Idioma", value: program.repository_default_language_label },
    { label: "Palavras-chave", value: keyword("pt") }, { label: "Keywords", value: keyword("en") },
    { label: "Áreas de conhecimento CNPq", note: "Escolha manualmente na taxonomia controlada do RI; termos catalográficos não substituem a área CNPq." }, { label: "Resumo e abstract", note: "Copie do próprio trabalho e confira o idioma." },
  ];
  return <main className="dashboard-main dashboard-main--form"><div className="page-heading request-heading"><div><p className="eyebrow">RI/UFBA · guia assistido</p><h1>Autodepósito</h1><p>Passo a passo baseado nas telas observadas e nos tutoriais oficiais. O Pronto! não envia seu trabalho ao repositório.</p></div><span className="request-status">{snapshot.request.protocol}</span></div><RepositoryDepositGuide requestId={request.id} startedAt={progress?.started_at ?? null} fields={fields} /></main>;
}
