import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PRIVACY_NOTICE_VERSION } from "@/domain/privacy/notice";
import { PrivacyAcknowledgement } from "@/components/privacy-acknowledgement";
import type { Metadata } from "next";
import { isCurrentServiceAnnouncement } from "@/lib/service-announcements";
import { getInterfaceLanguage } from "@/lib/server-language";
import { AuthShell } from "@/components/auth-shell";
import { AuthFeedback } from "@/components/auth-feedback";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const titles = { pt: "Painel", en: "Dashboard", es: "Panel", de: "Dashboard", fr: "Tableau de bord", it: "Pannello" };
  return { title: titles[await getInterfaceLanguage()], robots: { index: false, follow: false } };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("full_name, role, status, avatar_choice").eq("id", user.id).single();
  if (profileError || !profile) return <AuthShell title="Não foi possível carregar sua conta" description="Sua sessão foi mantida. Tente abrir o painel novamente em instantes."><AuthFeedback error="Falha temporária ao consultar os dados da conta." /><Link href="/painel">Tentar novamente</Link></AuthShell>;
  if (profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/entrar?error=Esta%20conta%20n%C3%A3o%20est%C3%A1%20ativa.");
  }
  const now = new Date().toISOString();
  const { data: announcements } = await supabase.from("library_announcements").select("title,type,starts_at,ends_at").eq("active", true).neq("type", "normal").lte("starts_at", now).or(`ends_at.is.null,ends_at.gte.${now}`).order("starts_at", { ascending: false });
  const currentAnnouncement = announcements?.find((announcement) => isCurrentServiceAnnouncement(announcement, now));
  const serviceStatus = currentAnnouncement ? `Prazos impactados: ${currentAnnouncement.title}` : "Atendimento normal";
  const serviceStatusIsExceptional = Boolean(currentAnnouncement);
  const { data: acknowledgement } = await supabase.from("privacy_notice_acknowledgements").select("id").eq("profile_id", user.id).eq("notice_version", PRIVACY_NOTICE_VERSION).maybeSingle();
  if (!acknowledgement) {
    return <DashboardShell fullName={profile.full_name} role={profile.role} userId={user.id} avatarChoice={profile.avatar_choice} showNotifications={false} serviceStatus={serviceStatus} serviceStatusIsExceptional={serviceStatusIsExceptional}><main className="dashboard-main dashboard-main--narrow" aria-hidden="true" /><PrivacyAcknowledgement /></DashboardShell>;
  }
  return <DashboardShell fullName={profile.full_name} role={profile.role} userId={user.id} avatarChoice={profile.avatar_choice} serviceStatus={serviceStatus} serviceStatusIsExceptional={serviceStatusIsExceptional}>{children}</DashboardShell>;
}
