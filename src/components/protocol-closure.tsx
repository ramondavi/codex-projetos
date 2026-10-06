"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FinalDecisionDialog } from "@/components/final-decision-dialog";

export function ProtocolClosure({ requestId, ready }: { requestId: string; ready: boolean }) {
  const router=useRouter(); const [url,setUrl]=useState(""); const [busy,setBusy]=useState(""); const [message,setMessage]=useState(""); const [confirmingClosure,setConfirmingClosure]=useState(false);
  async function close(){setBusy("close");setMessage("");const {error}=await createClient().rpc("close_cataloging_request",{target_request_id:requestId,permanent_url:url.trim()});if(error){setMessage("Não foi possível encerrar. Confirme o endereço HTTPS e se ficha, Nada Consta e autodepósito estão registrados.");setBusy("");return;}router.refresh();}
  return <section className="panel protocol-closure"><p className="eyebrow">Encerramento</p><h2>Verificação da publicação no RI/UFBA</h2><p>Abra o registro no repositório, confirme a publicação e informe abaixo o endereço permanente ou Handle.</p><label>URL permanente ou Handle<input type="url" required placeholder="https://repositorio.ufba.br/handle/…" value={url} onChange={(event)=>setUrl(event.target.value)} /></label>{!ready&&<p className="form-hint">Antes do encerramento, devem estar registrados: ficha homologada, Nada Consta aprovado e início do autodepósito.</p>}<button className="button button--primary" disabled={!ready||busy!==""||!url.startsWith("https://")} onClick={()=>setConfirmingClosure(true)}>{busy==="close"?"Encerrando…":"Verifiquei no RI/UFBA e quero encerrar"}</button>{message&&<p className="auth-feedback" role="status">{message}</p>}{confirmingClosure&&<FinalDecisionDialog title="Encerrar este protocolo?" description="A publicação será registrada e o protocolo será concluído, iniciando as comunicações finais." confirmLabel="Confirmar encerramento" busy={busy==="close"} onCancel={()=>setConfirmingClosure(false)} onConfirm={close}/>}</section>;
}
