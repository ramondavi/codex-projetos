import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
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
  return <><SiteHeader /><main className="faq-page"><header className="container faq-heading"><p className="eyebrow">Informação e orientação</p><h1>Perguntas frequentes</h1><p>Respostas rápidas sobre solicitação, análise, liberação da ficha e autodepósito.</p></header><section className="container faq-list">{faqs.map((faq) => <details key={faq.id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section><section className="container help-preview" id="ajuda"><p className="eyebrow">Ajuda</p><h2>Precisa de outra orientação?</h2><p>Consulte primeiro as perguntas acima. Uma página dedicada de ajuda, com canais de atendimento, solução de problemas e orientações por etapa, será estruturada após aprovação do conteúdo.</p></section></main></>;
}
