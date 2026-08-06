import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { AuthFeedback } from "@/components/auth-feedback";
import { login } from "@/app/auth-actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  return (
    <AuthShell title="Entre na sua conta" description="Acompanhe sua solicitação e veja sempre qual é a próxima etapa.">
      <AuthFeedback error={error} message={message} />
      <form className="form-stack" action={login}>
        <label>E-mail institucional<input type="email" name="email" autoComplete="email" placeholder="seunome@ufba.br" required /></label>
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
