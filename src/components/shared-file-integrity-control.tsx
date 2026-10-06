"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/app-icon";
import { FinalDecisionDialog } from "@/components/final-decision-dialog";
import { createClient } from "@/lib/supabase/client";

export function SharedFileIntegrityControl({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function cancelRequest() {
    setBusy(true);
    setError(false);
    const { error: rpcError } = await createClient().rpc("cancel_request_for_failed_declaration", {
      target_request_id: requestId,
      failed_declarations: ["shared_file_changed"],
      explanation: "",
    });
    if (rpcError) { setBusy(false); setConfirming(false); setError(true); return; }
    router.push("/painel/fila");
    router.refresh();
  }

  return <aside className="panel shared-file-integrity">
    <AppIcon name="link" />
    <div><h2>Integridade do arquivo público</h2><p>Se constatar que o arquivo foi alterado, substituído ou removido antes do encerramento, registre o descumprimento da declaração. O protocolo será cancelado após sua confirmação.</p></div>
    <button className="button button--secondary button--small button--with-icon" type="button" onClick={() => setConfirming(true)}><AppIcon name="close" />Registrar descumprimento</button>
    {error && <p className="form-error" role="alert">Não foi possível cancelar o protocolo. Atualize a página e tente novamente.</p>}
    {confirming && <FinalDecisionDialog title="Cancelar por alteração do arquivo?" description="Confirme somente se o arquivo do link público foi alterado, substituído ou removido. O protocolo será cancelado e o estudante receberá um aviso padronizado." confirmLabel="Confirmar cancelamento" confirmDanger busy={busy} onCancel={() => setConfirming(false)} onConfirm={cancelRequest} />}
  </aside>;
}
