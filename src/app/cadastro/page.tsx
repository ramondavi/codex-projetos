import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { AuthFeedback } from "@/components/auth-feedback";
import { signup } from "@/app/auth-actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const privacyNoticeAvailable = Boolean(process.env.PRIVACY_NOTICE_VERSION);
  return (
    <AuthShell title="Crie sua conta" description="Sua conta é única. A matrícula será informada em cada nova solicitação.">
      <AuthFeedback error={error} message={privacyNoticeAvailable ? undefined : "Cadastro temporariamente indisponível enquanto o aviso de privacidade aguarda validação institucional."} />
      <form className="form-stack" action={signup}>
        <label>Nome completo<input name="name" autoComplete="name" required /></label>
        <label>CPF<input name="cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" required /></label>
        <label>E-mail institucional<input type="email" name="email" autoComplete="email" placeholder="seunome@ufba.br" required /></label>
        <div className="form-row">
          <label>Senha<input type="password" name="password" autoComplete="new-password" required /></label>
          <label>Confirmar senha<input type="password" name="passwordConfirmation" autoComplete="new-password" required /></label>
        </div>
        <label className="check"><input type="checkbox" name="privacyAccepted" required /> <span>Li e concordo com o aviso de privacidade.</span></label>
        <button className="button button--primary button--full" type="submit" disabled={!privacyNoticeAvailable}>Criar conta</button>
      </form>
      <p className="auth-card__footer">Já tem uma conta? <Link href="/entrar">Entrar</Link></p>
    </AuthShell>
  );
}
