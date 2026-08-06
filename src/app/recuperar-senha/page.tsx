import { AuthShell } from "@/components/auth-shell";
import { AuthFeedback } from "@/components/auth-feedback";
import { requestPasswordReset } from "@/app/auth-actions";

export default async function PasswordRecoveryPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  return (
    <AuthShell title="Recupere sua senha" description="Enviaremos as instruções se o endereço estiver cadastrado.">
      <AuthFeedback error={error} message={message} />
      <form className="form-stack" action={requestPasswordReset}>
        <label>E-mail institucional<input type="email" name="email" autoComplete="email" placeholder="seunome@ufba.br" required /></label>
        <button className="button button--primary button--full" type="submit">Enviar link de recuperação</button>
      </form>
    </AuthShell>
  );
}
