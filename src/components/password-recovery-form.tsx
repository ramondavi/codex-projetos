import { requestPasswordReset } from "@/app/auth-actions";
import { InstitutionalEmailInput } from "./institutional-email-input";

export function PasswordRecoveryForm() {
  return <form className="form-stack" action={requestPasswordReset}>
    <label>E-mail institucional<InstitutionalEmailInput /></label>
    <button className="button button--primary button--full" type="submit">Enviar link de recuperação</button>
  </form>;
}
