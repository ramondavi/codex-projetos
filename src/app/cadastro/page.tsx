import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { AuthFeedback } from "@/components/auth-feedback";
import { signup } from "@/app/auth-actions";
import { authPageMetadata } from "@/lib/auth-page-metadata";
import { PasswordRequirements } from "@/components/password-requirements";
import { PRIVACY_NOTICE_VERSION } from "@/domain/privacy/notice";

export const generateMetadata = () => authPageMetadata("signup");

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthShell title="Crie sua conta" description="Sua conta é única. A matrícula será informada em cada nova solicitação.">
      <AuthFeedback error={error} />
      <form className="form-stack" action={signup}>
        <label>Nome completo<input name="name" autoComplete="name" required /></label>
        <label>CPF<input name="cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" required /></label>
        <div className="signup-birth-field">
          <div className="field-label-with-tooltip">
            <label htmlFor="signup-birth-date">Data de nascimento</label>
            <button className="tooltip" type="button" aria-label="Informações sobre o uso da data de nascimento" aria-describedby="signup-birth-help">i<span id="signup-birth-help" role="tooltip">A data completa fica salva na sua conta. O ano poderá ser utilizado na ficha catalográfica caso você autorize quando solicitá-la.</span></button>
          </div>
          <input id="signup-birth-date" type="date" name="birthDate" autoComplete="bday" min="1900-01-01" max={new Date().toISOString().slice(0, 10)} required />
        </div>
        <label>E-mail institucional<input type="email" name="email" autoComplete="email" placeholder="Seu e-mail institucional" required /></label>
        <PasswordRequirements />
        <label className="check"><input type="checkbox" name="privacyAccepted" required /> <span>Li e estou ciente da <Link href="/politica-de-privacidade" target="_blank">Política de Privacidade v{PRIVACY_NOTICE_VERSION}</Link>.</span></label>
        <button className="button button--primary button--full" type="submit">Criar conta</button>
      </form>
      <p className="auth-card__footer">Já tem uma conta? <Link href="/entrar">Entrar</Link></p>
    </AuthShell>
  );
}
