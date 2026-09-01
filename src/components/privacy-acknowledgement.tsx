"use client";

import { useActionState, useEffect } from "react";
import { acknowledgePrivacyNotice, type PrivacyAcknowledgementState } from "@/app/auth-actions";

const initialState: PrivacyAcknowledgementState = {};

export function PrivacyAcknowledgement() {
  const [state, action, pending] = useActionState(acknowledgePrivacyNotice, initialState);

  useEffect(() => {
    if (state.success) window.location.replace("/painel");
  }, [state.success]);

  return <div className="privacy-acknowledgement__actions"><a className="button button--secondary" href="/politica-de-privacidade" target="_blank">Ler a política v1.0</a><form action={action}><button className="button button--primary" type="submit" disabled={pending}>{pending ? "Registrando..." : "Li e estou ciente"}</button></form>{state.error && <p className="auth-feedback auth-feedback--error" role="alert">{state.error}</p>}</div>;
}
