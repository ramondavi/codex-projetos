"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PasswordRecoveryForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });
    setMessage(error ? "Não foi possível enviar agora. Aguarde um minuto e tente novamente." : "Se o endereço estiver cadastrado, enviaremos as instruções.");
    setBusy(false);
  }

  return <form className="form-stack" onSubmit={submit}>
    <label>E-mail institucional<input type="email" name="email" autoComplete="email" placeholder="seunome@ufba.br" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    {message && <p className="auth-feedback" role="status">{message}</p>}
    <button className="button button--primary button--full" type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar link de recuperação"}</button>
  </form>;
}
