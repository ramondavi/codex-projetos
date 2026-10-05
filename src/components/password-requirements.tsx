"use client";

import { useId, useState } from "react";
import { passwordRequirements } from "@/domain/auth/password";
import { AppIcon } from "./app-icon";

export function PasswordRequirements({ confirmationLabel = "Confirmar senha", passwordLabel = "Senha", errors, onFieldChange }: { confirmationLabel?: string; passwordLabel?: string; errors?: { password?: string; passwordConfirmation?: string }; onFieldChange?: (field: "password" | "passwordConfirmation") => void }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const id = useId();
  const requirements = passwordRequirements(password);
  const matches = confirmation.length > 0 && password === confirmation;

  return <div className="password-fields">
    <div className="form-row">
      <div className="password-field"><label htmlFor={`${id}-password`}>{passwordLabel}</label><div className="password-input-wrap"><input id={`${id}-password`} type={showPassword ? "text" : "password"} name="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); onFieldChange?.("password"); }} required aria-invalid={Boolean(errors?.password)} aria-describedby={`password-requirements${errors?.password ? ` ${id}-password-error` : ""}`} /><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}><AppIcon name={showPassword ? "eyeOff" : "eye"} /></button></div>{errors?.password && <span id={`${id}-password-error`} className="signup-field-error" role="alert">{errors.password}</span>}</div>
      <div className="password-field"><label htmlFor={`${id}-confirmation`}>{confirmationLabel}</label><div className="password-input-wrap"><input id={`${id}-confirmation`} type={showConfirmation ? "text" : "password"} name="passwordConfirmation" minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); onFieldChange?.("passwordConfirmation"); }} required aria-invalid={Boolean(errors?.passwordConfirmation)} aria-describedby={`password-requirements${errors?.passwordConfirmation ? ` ${id}-confirmation-error` : ""}`} /><button type="button" aria-label={showConfirmation ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"} aria-pressed={showConfirmation} onClick={() => setShowConfirmation((value) => !value)}><AppIcon name={showConfirmation ? "eyeOff" : "eye"} /></button></div>{errors?.passwordConfirmation && <span id={`${id}-confirmation-error`} className="signup-field-error" role="alert">{errors.passwordConfirmation}</span>}</div>
    </div>
    <div className="password-requirements" id="password-requirements" aria-label="Requisitos da senha"><strong>Confira sua senha</strong><p className={requirements.minLength ? "is-met" : ""}><span aria-hidden="true">{requirements.minLength ? "✓" : "○"}</span> Pelo menos 8 caracteres</p><p className={requirements.uppercase ? "is-met" : ""}><span aria-hidden="true">{requirements.uppercase ? "✓" : "○"}</span> Pelo menos uma letra maiúscula</p><p className={requirements.number ? "is-met" : ""}><span aria-hidden="true">{requirements.number ? "✓" : "○"}</span> Pelo menos um número</p><p className={requirements.special ? "is-met" : ""}><span aria-hidden="true">{requirements.special ? "✓" : "○"}</span> Pelo menos um caractere especial (ex.: !, @, #)</p><p className={matches ? "is-met" : ""}><span aria-hidden="true">{matches ? "✓" : "○"}</span> As senhas coincidem</p></div>
  </div>;
}
