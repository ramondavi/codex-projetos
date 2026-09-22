import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { HelpSearch } from "@/components/help-search";
import { helpArticles, quickDoubts } from "@/lib/knowledge-base";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description: "Tire dúvidas sobre ficha catalográfica, análise bibliotecária, Nada Consta e autodepósito no RI/UFBA.",
  alternates: { canonical: "/perguntas-frequentes" },
};

type Faq = { id: string; question: string; answer: string };
const fallbackFaqs: Faq[] = [
  { id: "fallback-1", question: "Quem pode usar o Pronto!?", answer: "Estudantes da UFBA que precisam solicitar ficha catalográfica e realizar o autodepósito, além da equipe autorizada da BIB/FA." },
  { id: "fallback-2", question: "O trabalho completo é enviado ao Pronto!?", answer: "Não. O estudante informa um link público para análise e o PDF completo permanece no próprio dispositivo durante a mesclagem da ficha." },
  { id: "fallback-3", question: "Quando posso baixar a ficha?", answer: "Depois que a ficha for homologada pela biblioteca e o Nada Consta for aprovado." },
  { id: "fallback-4", question: "O sistema deposita o trabalho automaticamente no RI/UFBA?", answer: "Não. O Pronto! orienta e reaproveita metadados, mas o depósito e as escolhas de licença são feitos pelo estudante no Repositório Institucional." },
  { id: "fallback-5", question: "O PDF final é automaticamente certificado como PDF/A?", answer: "Não. O navegador gera o arquivo final, mas a conferência ou conversão para PDF/A continua sendo responsabilidade do estudante conforme a exigência do RI/UFBA." },
  { id: "fallback-6", question: "Como acompanho uma correção solicitada?", answer: "Entre no painel e abra sua solicitação. Somente os campos devolvidos pela biblioteca ficarão disponíveis para correção." },
];

export default async function FrequentlyAskedQuestionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("frequently_asked_questions").select("id,question,answer").eq("active", true).order("position");
  const faqs = data?.length ? data as Faq[] : fallbackFaqs;
  return <><SiteHeader /><main className="faq-page"><header className="container faq-heading"><p className="eyebrow">Central de dúvidas</p><h1>Encontre a orientação certa.</h1><p>Pesquise perguntas, dúvidas rápidas e artigos completos sobre cada etapa.</p></header><HelpSearch /><section className="container knowledge-category" aria-labelledby="duvidas-rapidas"><p className="eyebrow">Dúvidas rápidas</p><h2 id="duvidas-rapidas">Respostas essenciais</h2><div className="knowledge-cards">{quickDoubts.map((item) => <article key={item.id}><span>{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p></article>)}</div></section><section className="container faq-list" aria-labelledby="perguntas-frequentes"><p className="eyebrow">Perguntas frequentes</p><h2 id="perguntas-frequentes">O que mais perguntam</h2>{faqs.map((faq) => <details id={`faq-${faq.id}`} key={faq.id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section><section className="container knowledge-category" aria-labelledby="artigos-ajuda"><p className="eyebrow">Artigos de ajuda</p><h2 id="artigos-ajuda">Guias completos</h2><div className="knowledge-cards">{helpArticles.map((article) => <article key={article.id}><span>{article.category}</span><h3>{article.title}</h3><p>{article.summary}</p><a href={`/perguntas-frequentes/artigos/${article.slug}`}>Ler artigo →</a></article>)}</div></section><section className="container help-contact" aria-labelledby="contato-ajuda"><div><p className="eyebrow">Fale com a Biblioteca</p><h2 id="contato-ajuda">Ainda precisa de orientação?</h2><p>Para dúvidas sobre o uso do Pronto!, entre em contato com a BIB/FA.</p></div><address><a href="mailto:bibarq@ufba.br">bibarq@ufba.br</a><a href="tel:+557132835888">(71) 3283-5888</a></address></section></main></>;
}
