import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: profile } = await supabase.from("profiles").select("full_name, role, status").eq("id", user.id).single();
  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/entrar?error=Esta%20conta%20n%C3%A3o%20est%C3%A1%20ativa.");
  }
  return <DashboardShell fullName={profile.full_name} role={profile.role}>{children}</DashboardShell>;
}
