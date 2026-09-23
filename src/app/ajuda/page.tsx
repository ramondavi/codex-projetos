import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { HelpSearch } from "@/components/help-search";
import { AppIcon } from "@/components/app-icon";
import { getPublishedKnowledge, safeKnowledgeHtml } from "@/lib/knowledge-service";

export const metadata: Metadata = {
  title: "Central de ajuda",
  description: "Guias, perguntas frequentes e orientações para usar o Pronto!.",
  alternates: { canonical: "/ajuda" },
};

export default async function HelpPage() {
  const entries = await getPublishedKnowledge();
  const faqs = entries.filter((entry) => entry.kind === "faq");
  const articles = entries.filter((entry) => entry.kind === "article" && entry.slug);
  return <><SiteHeader /><main className="faq-page">
    <header className="container faq-heading"><p className="eyebrow">Central de ajuda</p><h1>Encontre a orientação certa.</h1><p>Pesquise perguntas, respostas e artigos completos sobre cada etapa.</p></header>
    <HelpSearch />
    <section className="container faq-list" aria-labelledby="perguntas-frequentes"><p className="eyebrow">Perguntas frequentes</p><h2 id="perguntas-frequentes">O que mais perguntam</h2>{faqs.map((faq) => <details key={faq.id}><summary>{faq.title}</summary><div className="knowledge-rich-content" dangerouslySetInnerHTML={{ __html: safeKnowledgeHtml(faq.body_html || `<p>${faq.summary}</p>`) }} /></details>)}</section>
    <section className="container knowledge-category" aria-labelledby="artigos-ajuda"><p className="eyebrow">Artigos de ajuda</p><h2 id="artigos-ajuda">Guias completos</h2><div className="knowledge-cards">{articles.map((article) => <article key={article.id}><AppIcon name={article.category === "Análise" ? "review" : article.category === "Autodepósito" ? "upload" : "document"} /><span>{article.category}</span><h3>{article.title}</h3><p>{article.summary}</p><Link href={`/ajuda/artigos/${article.slug}`}>Ler artigo →</Link></article>)}</div></section>
    <section className="container help-contact" aria-labelledby="contato-ajuda"><div><p className="eyebrow">Fale com a Biblioteca</p><h2 id="contato-ajuda">Ainda precisa de orientação?</h2><p>Para dúvidas sobre o uso do Pronto!, entre em contato com a BIB/FA.</p></div><address><a href="mailto:bibarq@ufba.br">bibarq@ufba.br</a><a href="tel:+557132835888">(71) 3283-5888</a></address></section>
  </main></>;
}
