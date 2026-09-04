import { redirect } from "next/navigation";
import { AdminOperations } from "@/components/admin-operations";
import { CduCatalogAdmin } from "@/components/cdu-catalog-admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const areaParam = (await searchParams).area;
  const area = areaParam === "conteudo" || areaParam === "controle" ? areaParam : "operacao";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (profile?.role !== "administrator") redirect("/painel");
  const [users, candidates, programs, announcements, templates, logs, purge, faqs, cduDescriptions] = await Promise.all([
    supabase.from("profiles").select("id,full_name,email,role,status,created_at,staff_profiles(professional_name,crb)").order("full_name"),
    supabase.rpc("list_confirmed_staff_candidates"),
    supabase.from("academic_programs").select("id,name,level,service_level_business_days,repository_deposit_enabled,coordination_magic_link_enabled,coordination_contacts(name,email,active)").eq("active", true).order("name"),
    supabase.from("library_announcements").select("id,type,title,message,starts_at,ends_at,active,calendar_source,source_reference").order("starts_at", { ascending: false }),
    supabase.from("issue_templates").select("id,code,label,message,active,position").order("position"),
    supabase.from("audit_logs").select("id,action,entity_type,entity_id,metadata,occurred_at,profiles:actor_id(full_name)").order("occurred_at", { ascending: false }).limit(200),
    supabase.from("nada_consta_documents").select("id,request_id,object_path,purge_after,cataloging_requests(protocol)").lte("purge_after", new Date().toISOString()).not("object_path", "is", null).order("purge_after"),
    supabase.from("frequently_asked_questions").select("id,question,answer,position,active,featured_position").order("position"),
    supabase.from("cdu_code_descriptions").select("cdu_code,description,composition_notes,auxiliary_codes,related_codes,source_reference,validated").order("cdu_code"),
  ]);
  return <main className="dashboard-main"><div className="page-heading"><div><p className="eyebrow">Administração</p><h1>Administração e operação</h1><p>Configurações organizadas por assunto em um único espaço protegido.</p></div></div><AdminOperations area={area} users={users.data ?? []} staffCandidates={candidates.data ?? []} programs={programs.data ?? []} announcements={announcements.data ?? []} templates={templates.data ?? []} logs={logs.data ?? []} purgeDocuments={purge.data ?? []} faqs={faqs.data ?? []} /><CduCatalogAdmin entries={cduDescriptions.data ?? []} /></main>;
}
