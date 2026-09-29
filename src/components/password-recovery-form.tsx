import { requestPasswordReset } from "@/app/auth-actions";

export function PasswordRecoveryForm() {
  return <form className="form-stack" action={requestPasswordReset}>
    <label>E-mail institucional<input type="email" name="email" autoComplete="email" placeholder="Seu e-mail institucional" required /></label>
    <button className="button button--primary button--full" type="submit">Enviar link de recuperação</button>
  </form>;
}
