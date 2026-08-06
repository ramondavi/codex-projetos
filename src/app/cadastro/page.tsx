import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell title="Crie sua conta" description="Sua conta é única. A matrícula será informada em cada nova solicitação.">
      <form className="form-stack" method="post">
        <label>Nome completo<input name="name" autoComplete="name" required /></label>
        <label>CPF<input name="cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" required /></label>
        <label>E-mail<input type="email" name="email" autoComplete="email" required /></label>
        <div className="form-row">
          <label>Senha<input type="password" name="password" autoComplete="new-password" required /></label>
          <label>Confirmar senha<input type="password" name="passwordConfirmation" autoComplete="new-password" required /></label>
        </div>
        <label className="check"><input type="checkbox" required /> <span>Li e concordo com o aviso de privacidade.</span></label>
        <button className="button button--primary button--full" type="submit">Criar conta</button>
      </form>
      <p className="auth-card__footer">Já tem uma conta? <Link href="/entrar">Entrar</Link></p>
    </AuthShell>
  );
}
