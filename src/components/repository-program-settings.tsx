"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
type Program = { id: string; name: string; level: string; repository_deposit_enabled: boolean; repository_collection_label: string | null };
export function RepositoryProgramSettings({ programs }: { programs: Program[] }) {
  const [items,setItems]=useState(programs); const [busy,setBusy]=useState(""); const [message,setMessage]=useState("");
  async function toggle(program: Program) { setBusy(program.id); setMessage(""); const enabled=!program.repository_deposit_enabled; const { error }=await createClient().rpc("set_repository_deposit_enabled",{target_program_id:program.id,enabled}); if(error)setMessage("Não foi possível alterar a configuração."); else {setItems((current)=>current.map((item)=>item.id===program.id?{...item,repository_deposit_enabled:enabled}:item));setMessage("Configuração salva e registrada no log.");} setBusy(""); }
  return <section className="program-settings">{message&&<p className="auth-feedback" role="status">{message}</p>}{items.map((program)=><article className="panel" key={program.id}><div><span>{program.level}</span><h2>{program.name}</h2><p>{program.repository_collection_label ?? "Coleção do RI ainda não configurada."}</p></div><button className={`button button--small ${program.repository_deposit_enabled?"button--secondary":"button--primary"}`} disabled={busy===program.id} onClick={()=>toggle(program)}>{program.repository_deposit_enabled?"Desativar guia":"Ativar guia"}</button></article>)}</section>;
}
