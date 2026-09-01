import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { AuthFeedback } from "@/components/auth-feedback";
import { signup } from "@/app/auth-actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthShell title="Crie sua conta" description="Sua conta é única. A matrícula será informada em cada nova solicitação.">
      <AuthFeedback error={error} />
      <form className="form-stack" action={signup}>
        <label>Nome completo<input name="name" autoComplete="name" required /></label>
        <label>CPF<input name="cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" required /></label>
        <label>E-mail institucional<input type="email" name="email" autoComplete="email" placeholder="seunome@ufba.br" required /></label>
        <div className="form-row">
          <label>Senha<input type="password" name="password" autoComplete="new-password" required /></label>
          <label>Confirmar senha<input type="password" name="passwordConfirmation" autoComplete="new-password" required /></label>
        </div>
        <label className="check"><input type="checkbox" name="privacyAccepted" required /> <span>Li e estou ciente da <Link href="/politica-de-privacidade" target="_blank">Política de Privacidade v1.0</Link>.</span></label>
        <button className="button button--primary button--full" type="submit">Criar conta</button>
      </form>
      <p className="auth-card__footer">Já tem uma conta? <Link href="/entrar">Entrar</Link></p>
    </AuthShell>
  );
}
