"use client";

import { useMemo, useState } from "react";

type SearchItem = { id: string; title: string; content: string; href: string; kind: "Pergunta frequente" | "Ajuda" };

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function HelpSearch({ faqs, help }: { faqs: { id: string; question: string; answer: string }[]; help: { id: string; title: string; content: string }[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const search = normalize(query.trim());
    if (!search) return [];
    return [
      ...faqs.map((faq) => ({ id: faq.id, title: faq.question, content: faq.answer, href: `#faq-${faq.id}`, kind: "Pergunta frequente" as const })),
      ...help.map((item) => ({ ...item, href: `#ajuda-${item.id}`, kind: "Ajuda" as const })),
    ].filter((item) => normalize(`${item.title} ${item.content}`).includes(search)).slice(0, 6);
  }, [faqs, help, query]);

  function selectResult(href: string) {
    setQuery("");
    if (href.startsWith("#faq-")) document.querySelector<HTMLDetailsElement>(href)?.setAttribute("open", "");
  }

  return <section className="container help-search" aria-labelledby="busca-ajuda"><label id="busca-ajuda" htmlFor="busca-ajuda-input">Encontre uma resposta</label><div className="help-search__field"><input id="busca-ajuda-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquise dúvidas, etapas ou orientações" autoComplete="off" aria-autocomplete="list" aria-controls="sugestoes-ajuda" /><span aria-hidden="true">⌕</span></div>{query && <div className="help-search__suggestions" id="sugestoes-ajuda" role="region" aria-live="polite">{results.length ? <ul>{results.map((result) => <li key={`${result.kind}-${result.id}`}><a href={result.href} onClick={() => selectResult(result.href)}><small>{result.kind}</small><strong>{result.title}</strong><span>{result.content}</span></a></li>)}</ul> : <p>Nenhuma orientação encontrada. Tente usar outras palavras.</p>}</div>}</section>;
}
