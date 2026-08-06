import { updatePassword } from "@/app/auth-actions";
import { AuthFeedback } from "@/components/auth-feedback";
import { AuthShell } from "@/components/auth-shell";

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthShell title="Defina uma nova senha" description="Escolha uma nova senha para sua conta institucional.">
      <AuthFeedback error={error} />
      <form className="form-stack" action={updatePassword}>
        <label>Nova senha<input type="password" name="password" minLength={8} autoComplete="new-password" required /></label>
        <label>Confirmar nova senha<input type="password" name="passwordConfirmation" minLength={8} autoComplete="new-password" required /></label>
        <button className="button button--primary button--full" type="submit">Atualizar senha</button>
      </form>
    </AuthShell>
  );
}
