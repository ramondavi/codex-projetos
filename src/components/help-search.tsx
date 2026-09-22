"use client";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { KnowledgeItem } from "@/lib/knowledge-base";
export function HelpSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState(""); const [results, setResults] = useState<KnowledgeItem[]>([]); const id = useId();
  useEffect(() => { const term = query.trim(); if (term.length < 2) { setResults([]); return; } const timer = window.setTimeout(async () => { const response = await fetch(`/api/central-de-duvidas?q=${encodeURIComponent(term)}`); if (response.ok) setResults((await response.json()).results); }, 180); return () => window.clearTimeout(timer); }, [query]);
  const href = (item: KnowledgeItem) => item.slug ? `/perguntas-frequentes/artigos/${item.slug}` : "/perguntas-frequentes";
  return <section className={`help-search${compact ? " help-search--compact" : " container"}`} aria-labelledby={`busca-${id}`}><label id={`busca-${id}`} htmlFor={`busca-input-${id}`}>{compact ? "Dúvida durante o preenchimento?" : "Encontre uma resposta"}</label><div className="help-search__field"><input id={`busca-input-${id}`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquise dúvidas, perguntas ou artigos" autoComplete="off" aria-autocomplete="list" aria-controls={`sugestoes-${id}`} /><span aria-hidden="true">⌕</span></div>{query.trim().length >= 2 && <div className="help-search__suggestions" id={`sugestoes-${id}`} role="region" aria-live="polite">{results.length ? <ul>{results.map((item) => <li key={`${item.kind}-${item.id}`}><Link href={href(item)} onClick={() => setQuery("")}><small>{item.kind} · {item.category}</small><strong>{item.title}</strong><span>{item.summary}</span></Link></li>)}</ul> : <p>Nenhum resultado encontrado.</p>}</div>}</section>;
}
