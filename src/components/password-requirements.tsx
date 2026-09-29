"use client";

import { useState } from "react";
import { passwordRequirements } from "@/domain/auth/password";

export function PasswordRequirements({ confirmationLabel = "Confirmar senha", passwordLabel = "Senha" }: { confirmationLabel?: string; passwordLabel?: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const requirements = passwordRequirements(password);
  const matches = confirmation.length > 0 && password === confirmation;

  return <div className="password-fields">
    <div className="form-row"><label>{passwordLabel}<input type="password" name="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required aria-describedby="password-requirements" /></label><label>{confirmationLabel}<input type="password" name="passwordConfirmation" minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required aria-describedby="password-requirements" /></label></div>
    <div className="password-requirements" id="password-requirements" aria-label="Requisitos da senha"><strong>Confira sua senha</strong><p className={requirements.minLength ? "is-met" : ""}><span aria-hidden="true">{requirements.minLength ? "✓" : "○"}</span> Pelo menos 8 caracteres</p><p className={requirements.uppercase ? "is-met" : ""}><span aria-hidden="true">{requirements.uppercase ? "✓" : "○"}</span> Pelo menos uma letra maiúscula</p><p className={requirements.number ? "is-met" : ""}><span aria-hidden="true">{requirements.number ? "✓" : "○"}</span> Pelo menos um número</p><p className={requirements.special ? "is-met" : ""}><span aria-hidden="true">{requirements.special ? "✓" : "○"}</span> Pelo menos um caractere especial (ex.: !, @, #)</p><p className={matches ? "is-met" : ""}><span aria-hidden="true">{matches ? "✓" : "○"}</span> As senhas coincidem</p></div>
  </div>;
}
