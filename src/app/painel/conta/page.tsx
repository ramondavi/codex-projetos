import { panelMetadata } from "@/lib/panel-metadata";
export async function generateMetadata() { return panelMetadata("/painel/conta"); }
import { AppIcon } from "@/components/app-icon";
import { maskCpf } from "@/domain/students/cpf";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requestAuthenticatedPasswordChange, requestEmailChange, updateBirthDate } from "@/app/auth-actions";
import { AuthFeedback } from "@/components/auth-feedback";
import { StaffAvatarPicker } from "@/components/staff-avatar-picker";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const [{ data: profile }, { data: studentProfile }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, role, avatar_choice").eq("id", user.id).single(),
    supabase.from("student_profiles").select("cpf, birth_date").eq("profile_id", user.id).maybeSingle(),
  ]);
  if (!profile) redirect("/entrar");
  return (
    <main className="dashboard-main dashboard-main--narrow">
      <div className="page-heading"><div><h1><AppIcon className="panel-heading-icon" name="account" />Minha conta</h1></div></div>
      <section className="panel account-panel">
        <div><span>Nome</span><strong>{profile.full_name}</strong></div>
        {studentProfile && <div><span>CPF</span><strong>{maskCpf(studentProfile.cpf)}</strong></div>}
        {studentProfile?.birth_date && <div><span>Data de nascimento</span><strong>{studentProfile.birth_date.split("-").reverse().join("/")}</strong></div>}
        <div><span>E-mail</span><strong>{profile.email}</strong></div>
        <p>A matrícula será informada em cada nova solicitação, pois ela pode mudar em um novo vínculo acadêmico.</p>
      </section>
      {(profile.role === "cataloger" || profile.role === "administrator") && <StaffAvatarPicker userId={user.id} fullName={profile.full_name} currentChoice={profile.avatar_choice} />}
      {profile.role === "student" && studentProfile && !studentProfile.birth_date && <section className="panel account-email-panel">
        <div><p className="eyebrow">Dados pessoais</p><h2>Informar data de nascimento</h2><p>A data completa fica salva na sua conta. O ano poderá ser utilizado na ficha catalográfica caso você autorize quando solicitá-la. Após salvar, somente um administrador poderá corrigir essa data.</p></div>
        <AuthFeedback error={error?.includes("nascimento") || error?.includes("data") ? error : undefined} message={message?.includes("nascimento") ? message : undefined} />
        <form className="form-stack" action={updateBirthDate}><label>Data de nascimento<input type="date" name="birthDate" autoComplete="bday" min="1900-01-01" max={new Date().toISOString().slice(0, 10)} required /></label><button className="button button--primary" type="submit">Salvar data</button></form>
      </section>}
      <section className="panel account-email-panel">
        <div>
          <p className="eyebrow">E-mail institucional</p>
          <h2>Alterar e-mail</h2>
          <p>O novo e-mail deve ser institucional da UFBA (@ufba.br).</p>
        </div>
        <AuthFeedback error={error?.includes("nascimento") || error?.includes("data") ? undefined : error} message={message?.includes("nascimento") ? undefined : message} />
        <form className="form-stack" action={requestEmailChange}>
          <label>Novo e-mail institucional<input type="email" name="email" autoComplete="email" placeholder="novoemail@ufba.br" required /></label>
          <button className="button button--primary" type="submit">Solicitar alteração</button>
        </form>
      </section>
      <section className="panel account-email-panel">
        <div>
          <p className="eyebrow">Segurança</p>
          <h2>Alterar senha</h2>
          <p>Para proteger sua conta, enviaremos um link de confirmação para seu e-mail institucional. A nova senha só poderá ser definida depois que você abrir esse link.</p>
        </div>
        <form action={requestAuthenticatedPasswordChange}>
          <button className="button button--secondary" type="submit">Enviar link para alterar senha</button>
        </form>
      </section>
    </main>
  );
}
