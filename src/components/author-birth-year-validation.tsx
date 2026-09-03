"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthorBirthYearValidation({ requestId, year, validated, editable, onValidated }: { requestId: string; year?: number | null; validated?: boolean; editable: boolean; onValidated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!year) return null;
  async function validate() {
    setBusy(true); setError("");
    const { error: rpcError } = await createClient().rpc("validate_author_birth_year", { target_request_id: requestId, validated_birth_year: year });
    if (rpcError) setError("Não foi possível registrar a validação. Confira o Pergamum e tente novamente.");
    else onValidated();
    setBusy(false);
  }
  return <div className="author-birth-year-validation"><strong>Ano de nascimento informado: {year}</strong><p>{validated ? "Validado no Pergamum e incluído na ficha." : "Confira o registro acadêmico no Pergamum antes de confirmar a exibição na ficha."}</p>{editable && !validated && <button className="button button--secondary button--small" type="button" disabled={busy} onClick={validate}>{busy ? "Validando…" : "Validar no Pergamum"}</button>}{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
