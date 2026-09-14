"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NadaConstaUpload({ requestId, document }: { requestId: string; document: { original_name: string; size_bytes: number; status: string; rejection_reason: string | null } | null }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    if (!file) return;
    setBusy(true); setError("");
    const form = new FormData(); form.set("requestId", requestId); form.set("file", file);
    const response = await fetch("/api/nada-consta", { method: "POST", body: form });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Não foi possível enviar o documento."); setBusy(false); return; }
    setFile(null); router.refresh();
  }
  const status = document?.status === "approved" ? "Validado pela biblioteca" : document?.status === "pending" ? "Aguardando validação" : document?.status === "rejected" ? "Devolvido pela biblioteca" : null;
  return <section className="panel nada-consta-panel"><div><p className="eyebrow">Documento temporário</p><h2>Nada Consta</h2><p>Envie-o assim que estiver disponível: a biblioteca pode validá-lo enquanto analisa os metadados. A ficha só será liberada após a homologação e essa validação.</p></div>{document && <div className={`document-state document-state--${document.status}`}><strong>{status}</strong><span>{document.original_name} · {formatBytes(document.size_bytes)}</span>{document.rejection_reason && <p>{document.rejection_reason}</p>}</div>}{(!document || document.status === "rejected") && <><label>PDF do Nada Consta<input type="file" accept="application/pdf,.pdf" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(""); }} /></label>{file && <div className="selected-file"><strong>{file.name}</strong><span>{formatBytes(file.size)}</span></div>}<p className="field-hint">PDF de até 5 MB. Extensão, tipo e assinatura interna serão conferidos antes do armazenamento privado.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--primary" type="button" disabled={!file || busy} onClick={submit}>{busy ? "Validando e enviando…" : "Enviar Nada Consta"}</button></>}</section>;
}

function formatBytes(value: number) { return value < 1024 * 1024 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1024 / 1024).toFixed(2)} MB`; }
