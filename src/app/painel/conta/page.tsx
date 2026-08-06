import { maskCpf } from "@/domain/students/cpf";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requestEmailChange } from "@/app/auth-actions";
import { AuthFeedback } from "@/components/auth-feedback";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const [{ data: profile }, { data: studentProfile }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
    supabase.from("student_profiles").select("cpf").eq("profile_id", user.id).maybeSingle(),
  ]);
  if (!profile) redirect("/entrar");
  return (
    <main className="dashboard-main dashboard-main--narrow">
      <div className="page-heading"><div><p className="eyebrow">Minha conta</p><h1>Dados pessoais</h1></div></div>
      <section className="panel account-panel">
        <div><span>Nome</span><strong>{profile.full_name}</strong></div>
        {studentProfile && <div><span>CPF</span><strong>{maskCpf(studentProfile.cpf)}</strong></div>}
        <div><span>E-mail</span><strong>{profile.email}</strong></div>
        <p>A matrícula será informada em cada nova solicitação, pois ela pode mudar em um novo vínculo acadêmico.</p>
      </section>
      <section className="panel account-email-panel">
        <div>
          <p className="eyebrow">E-mail institucional</p>
          <h2>Alterar e-mail</h2>
          <p>O novo endereço deve pertencer ao domínio @ufba.br. A alteração só será concluída após as confirmações de segurança configuradas no Supabase.</p>
        </div>
        <AuthFeedback error={error} message={message} />
        <form className="form-stack" action={requestEmailChange}>
          <label>Novo e-mail institucional<input type="email" name="email" autoComplete="email" placeholder="novoemail@ufba.br" required /></label>
          <button className="button button--primary" type="submit">Solicitar alteração</button>
        </form>
      </section>
    </main>
  );
}
