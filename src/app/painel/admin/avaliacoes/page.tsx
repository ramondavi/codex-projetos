import { panelMetadata } from "@/lib/panel-metadata";
export async function generateMetadata() { return panelMetadata("/painel/admin/avaliacoes"); }
import { AppIcon } from "@/components/app-icon";
import { redirect } from "next/navigation";
import { FeedbackAdminDashboard } from "@/components/feedback-admin-dashboard";
import { createClient } from "@/lib/supabase/server";


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
  return <main className="dashboard-main"><div className="page-heading"><div><h1><AppIcon className="panel-heading-icon" name="review" />Avaliações</h1></div></div><FeedbackAdminDashboard activatedAt={campaign?.activated_at ?? null} siteUrl={campaign?.site_url ?? null} invitedCount={counts?.invited ?? 0} respondedCount={counts?.responded ?? 0} responses={(responses ?? []) as { id: string; answers: Record<string, string> }[]} /></main>;
}
