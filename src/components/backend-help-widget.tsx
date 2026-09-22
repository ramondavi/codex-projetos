"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppIcon } from "./app-icon";
import { HelpSearch } from "./help-search";
import type { KnowledgeItem } from "@/lib/knowledge-base";
export function BackendHelpWidget({ role }: { role: string }) {
  const pathname = usePathname(); const [open, setOpen] = useState(false); const [items, setItems] = useState<KnowledgeItem[]>([]);
  const context = pathname.includes("/admin") ? "administracao" : pathname.includes("/atendimento") || pathname.includes("/fila") ? "atendimento" : role === "student" ? "estudante" : "painel";
  useEffect(() => { if (!open) return; fetch(`/api/central-de-duvidas?context=${context}`).then((response) => response.ok ? response.json() : { results: [] }).then(({ results }) => setItems(results)); }, [context, open]);
  const label = context === "administracao" ? "Administração" : context === "atendimento" ? "Atendimento" : "Sua solicitação";
  return <div className={`backend-help${open ? " is-open" : ""}`}><button className="backend-help__trigger" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="ajuda-contextual" aria-label="Abrir ajuda contextual" title="Ajuda contextual"><AppIcon name="help" /></button>{open && <section className="backend-help__panel" id="ajuda-contextual" aria-label="Ajuda contextual"><header><p className="eyebrow">Ajuda para {label}</p><h2>Como podemos ajudar?</h2></header><HelpSearch compact />{items.length > 0 && <div className="backend-help__topics"><strong>Mais útil nesta tela</strong>{items.slice(0, 3).map((item) => <Link key={item.id} href={item.slug ? `/ajuda/artigos/${item.slug}` : "/ajuda"}>{item.title}</Link>)}</div>}<Link className="backend-help__all" href="/ajuda">Abrir Central de ajuda →</Link></section>}</div>;
}
