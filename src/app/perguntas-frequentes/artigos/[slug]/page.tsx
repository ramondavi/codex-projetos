import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { helpArticles } from "@/lib/knowledge-base";

export function generateStaticParams() { return helpArticles.map(({ slug }) => ({ slug })); }
export default async function KnowledgeArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = helpArticles.find((item) => item.slug === slug);
  if (!article?.body) notFound();
  return <><SiteHeader /><main className="knowledge-article"><header className="container knowledge-article__heading"><p className="eyebrow">{article.category} · {article.kind}</p><h1>{article.title}</h1><p>{article.summary}</p></header><article className="container knowledge-article__body">{article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<Link className="button button--secondary" href="/perguntas-frequentes">Voltar à Central de dúvidas</Link></article></main></>;
}
