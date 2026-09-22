import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { helpArticles } from "@/lib/knowledge-base";

export function generateStaticParams() { return helpArticles.map(({ slug }) => ({ slug })); }
export default async function KnowledgeArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const article = helpArticles.find((item) => item.slug === slug);
  if (!article?.sections) notFound();
  const related = helpArticles.filter((item) => item.id !== article.id).slice(0, 2);
  return <><SiteHeader /><main className="knowledge-article"><header className="container knowledge-article__heading"><p className="eyebrow">{article.category} · {article.kind}</p><h1>{article.title}</h1><p>{article.summary}</p></header><div className="container knowledge-article__layout"><aside className="knowledge-article__toc" aria-label="Neste artigo"><strong>Neste artigo</strong><ol>{article.sections.map((section, index) => <li key={section.title}><a href={`#secao-${index + 1}`}>{section.title}</a></li>)}</ol></aside><article className="knowledge-article__body">{article.sections.map((section, index) => <section id={`secao-${index + 1}`} key={section.title}><h2>{section.title}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.steps && <ol className="knowledge-article__steps">{section.steps.map((step) => <li key={step}>{step}</li>)}</ol>}</section>)}<Link className="button button--secondary" href="/ajuda">Voltar à Central de ajuda</Link></article></div><section className="container knowledge-related" aria-labelledby="artigos-relacionados"><p className="eyebrow">Continue aprendendo</p><h2 id="artigos-relacionados">Artigos relacionados</h2><div className="knowledge-cards">{related.map((item) => <article key={item.id}><span>{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/ajuda/artigos/${item.slug}`}>Ler artigo →</Link></article>)}</div></section></main></>;
}
