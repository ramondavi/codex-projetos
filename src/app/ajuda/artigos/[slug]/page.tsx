import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getPublishedKnowledge, safeKnowledgeHtml } from "@/lib/knowledge-service";
import { getInterfaceLanguage } from "@/lib/server-language";
import { helpCopy, helpCategoryLabel } from "@/lib/help-copy";

const articleCopy = {
  pt: ["Neste artigo", "Guia completo", "Voltar à Central de ajuda", "Continue aprendendo", "Artigos relacionados"],
  en: ["In this article", "Complete guide", "Back to Help center", "Keep learning", "Related articles"],
  es: ["En este artículo", "Guía completa", "Volver al Centro de ayuda", "Siga aprendiendo", "Artículos relacionados"],
  de: ["In diesem Artikel", "Ausführliche Anleitung", "Zurück zur Hilfe", "Mehr erfahren", "Verwandte Artikel"],
  fr: ["Dans cet article", "Guide complet", "Retour au Centre d’aide", "Pour aller plus loin", "Articles associés"],
  it: ["In questo articolo", "Guida completa", "Torna al Centro assistenza", "Continua a imparare", "Articoli correlati"],
};

export default async function KnowledgeArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const language = await getInterfaceLanguage();
  const t = helpCopy[language]; const a = articleCopy[language];
  const { slug } = await params;
  const articles = (await getPublishedKnowledge()).filter((entry) => entry.kind === "article" && entry.slug);
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) notFound();
  const sections: string[] = [];
  const html = safeKnowledgeHtml(article.body_html).replace(/<h2(\s[^>]*)?>(.*?)<\/h2>/g, (_match, attributes: string | undefined, heading: string) => {
    sections.push(heading.replace(/<[^>]*>/g, ""));
    return `<h2${attributes ?? ""} id="secao-${sections.length}">${heading}</h2>`;
  });
  const related = articles.filter((entry) => entry.id !== article.id && entry.category === article.category)
    .concat(articles.filter((entry) => entry.id !== article.id && entry.category !== article.category)).slice(0, 2);
  return <><SiteHeader /><main className="knowledge-article">
    <header className="container knowledge-article__heading"><p className="eyebrow">{helpCategoryLabel(language, article.category)} · {t.articles}</p><h1>{article.title}</h1><p>{article.summary}</p></header>
    <div className="container knowledge-article__layout">
      <aside className="knowledge-article__toc" aria-label={a[0]}><strong>{a[0]}</strong>{sections.length ? <ol>{sections.map((heading, index) => <li key={index}><a href={`#secao-${index + 1}`}>{heading}</a></li>)}</ol> : <p>{a[1]}</p>}</aside>
      <article className="knowledge-article__body"><div className="knowledge-rich-content" dangerouslySetInnerHTML={{ __html: html }} /><Link className="button button--secondary" href="/ajuda">{a[2]}</Link></article>
    </div>
    {related.length > 0 && <section className="container knowledge-related" aria-labelledby="artigos-relacionados"><p className="eyebrow">{a[3]}</p><h2 id="artigos-relacionados">{a[4]}</h2><div className="knowledge-cards">{related.map((item) => <article key={item.id}><span>{helpCategoryLabel(language, item.category)}</span><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/ajuda/artigos/${item.slug}`}>{t.read}</Link></article>)}</div></section>}
  </main></>;
}
