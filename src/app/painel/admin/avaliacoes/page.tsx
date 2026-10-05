import { redirect } from "next/navigation";
import { FeedbackAdminDashboard } from "@/components/feedback-admin-dashboard";
import { createClient } from "@/lib/supabase/server";
import { panelPageMetadata } from "@/lib/panel-page-metadata";
export const metadata = panelPageMetadata("Avaliações do Pronto!");


export default async function FeedbackAdministrationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (!user || profile?.role !== "administrator") redirect("/painel");
  const [{ data: campaign }, { data: stats }, { data: responses }] = await Promise.all([
    supabase.from("feedback_campaign").select("activated_at,site_url").eq("id", true).single(),
    supabase.rpc("feedback_campaign_stats"),
    supabase.from("feedback_responses").select("id,answers"),
  ]);
  const counts = stats as { invited?: number; responded?: number } | null;
  return <main className="dashboard-main"><div className="page-heading"><div><p className="eyebrow">Administração</p><h1>Avaliações do Pronto!</h1><p>Acompanhe a pesquisa de lançamento e as respostas anônimas recebidas.</p></div></div><FeedbackAdminDashboard activatedAt={campaign?.activated_at ?? null} siteUrl={campaign?.site_url ?? null} invitedCount={counts?.invited ?? 0} respondedCount={counts?.responded ?? 0} responses={(responses ?? []) as { id: string; answers: Record<string, string> }[]} /></main>;
}
