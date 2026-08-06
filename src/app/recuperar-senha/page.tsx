import { AuthShell } from "@/components/auth-shell";

export default function PasswordRecoveryPage() {
  return (
    <AuthShell title="Recupere sua senha" description="Enviaremos as instruções se o endereço estiver cadastrado.">
      <form className="form-stack" method="post">
        <label>E-mail<input type="email" name="email" autoComplete="email" required /></label>
        <button className="button button--primary button--full" type="submit">Enviar link de recuperação</button>
      </form>
    </AuthShell>
  );
}
