import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PRIVACY_NOTICE_VERSION } from "@/domain/privacy/notice";
import { PrivacyAcknowledgement } from "@/components/privacy-acknowledgement";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: profile } = await supabase.from("profiles").select("full_name, role, status").eq("id", user.id).single();
  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/entrar?error=Esta%20conta%20n%C3%A3o%20est%C3%A1%20ativa.");
  }
  const now = new Date().toISOString();
  const { data: announcements } = await supabase.from("library_announcements").select("title,type").eq("active", true).neq("type", "normal").lte("starts_at", now).or(`ends_at.is.null,ends_at.gte.${now}`).order("starts_at", { ascending: false }).limit(1);
  const serviceStatus = announcements?.[0] ? `Prazos impactados: ${announcements[0].title}` : "Atendimento normal";
  const serviceStatusIsExceptional = Boolean(announcements?.[0]);
  const { data: acknowledgement } = await supabase.from("privacy_notice_acknowledgements").select("id").eq("profile_id", user.id).eq("notice_version", PRIVACY_NOTICE_VERSION).maybeSingle();
  if (!acknowledgement) {
    return <DashboardShell fullName={profile.full_name} role={profile.role} serviceStatus={serviceStatus} serviceStatusIsExceptional={serviceStatusIsExceptional}><main className="dashboard-main dashboard-main--narrow privacy-acknowledgement"><p className="eyebrow">Antes de continuar</p><h1>Política de Privacidade</h1><p>O Pronto! atualizou sua Política de Privacidade. Leia o documento e registre sua ciência para acessar o painel.</p><PrivacyAcknowledgement /></main></DashboardShell>;
  }
  return <DashboardShell fullName={profile.full_name} role={profile.role} serviceStatus={serviceStatus} serviceStatusIsExceptional={serviceStatusIsExceptional}>{children}</DashboardShell>;
}
