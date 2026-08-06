import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell title="Entre na sua conta" description="Acompanhe sua solicitação e veja sempre qual é a próxima etapa.">
      <form className="form-stack" method="post">
        <label>E-mail<input type="email" name="email" autoComplete="email" placeholder="seuemail@exemplo.com" required /></label>
        <label>Senha<input type="password" name="password" autoComplete="current-password" placeholder="Sua senha" required /></label>
        <div className="form-row form-row--between">
          <label className="check"><input type="checkbox" /> <span>Lembrar de mim</span></label>
          <Link href="/recuperar-senha">Esqueci minha senha</Link>
        </div>
        <button className="button button--primary button--full" type="submit">Entrar</button>
      </form>
      <p className="auth-card__footer">Ainda não tem conta? <Link href="/cadastro">Criar conta</Link></p>
    </AuthShell>
  );
}
