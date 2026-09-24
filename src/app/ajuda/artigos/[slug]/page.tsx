import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getPublishedKnowledge, safeKnowledgeHtml } from "@/lib/knowledge-service";

export default async function KnowledgeArticlePage({ params }: { params: Promise<{ slug: string }> }) {
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
    <header className="container knowledge-article__heading"><p className="eyebrow">{article.category} · Artigo de ajuda</p><h1>{article.title}</h1><p>{article.summary}</p></header>
    <div className="container knowledge-article__layout">
      <aside className="knowledge-article__toc" aria-label="Neste artigo"><strong>Neste artigo</strong>{sections.length ? <ol>{sections.map((heading, index) => <li key={index}><a href={`#secao-${index + 1}`}>{heading}</a></li>)}</ol> : <p>Guia completo</p>}</aside>
      <article className="knowledge-article__body"><div className="knowledge-rich-content" dangerouslySetInnerHTML={{ __html: html }} /><Link className="button button--secondary" href="/ajuda">Voltar à Central de ajuda</Link></article>
    </div>
    {related.length > 0 && <section className="container knowledge-related" aria-labelledby="artigos-relacionados"><p className="eyebrow">Continue aprendendo</p><h2 id="artigos-relacionados">Artigos relacionados</h2><div className="knowledge-cards">{related.map((item) => <article key={item.id}><span>{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/ajuda/artigos/${item.slug}`}>Ler artigo →</Link></article>)}</div></section>}
  </main></>;
}
