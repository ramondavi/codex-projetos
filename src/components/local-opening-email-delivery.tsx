"use client";

import { useEffect, useState } from "react";
import { deliverLocalOpeningEmail } from "@/app/painel/solicitacao/email-actions";

export function LocalOpeningEmailDelivery({ requestId }: { requestId: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let running = false;
    async function deliver() {
      if (!active || running || document.visibilityState === "hidden") return;
      running = true;
      try {
        const result = await deliverLocalOpeningEmail(requestId);
        if (active) setFailed(result === "error");
      } catch {
        if (active) setFailed(true);
      } finally { running = false; }
    }
    void deliver();
    const timer = window.setInterval(() => { void deliver(); }, 30_000);
    document.addEventListener("visibilitychange", deliver);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", deliver); };
  }, [requestId]);
  return failed ? <p className="form-error" role="alert">Não foi possível entregar o e-mail de confirmação no Mailpit. Seu protocolo está salvo; a entrega pode ser tentada novamente ao recarregar a página.</p> : null;
}
