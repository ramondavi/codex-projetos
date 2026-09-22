import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { HelpSearch } from "@/components/help-search";
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
const helpSections = [
  { id: "antes", title: "Antes de começar", content: "Tenha em mãos o trabalho final, já defendido ou aprovado pela banca, com a folha de aprovação quando aplicável. O arquivo deve estar disponível por um link público." },
  { id: "solicitacao", title: "Durante a solicitação", content: "Preencha os dados com atenção. O rascunho é salvo automaticamente e pode ser retomado depois. O Pronto! recebe o link do trabalho, não o PDF completo." },
  { id: "analise", title: "Após a análise", content: "Acompanhe o protocolo pelo painel. Se a biblioteca solicitar correções, somente os campos indicados ficarão disponíveis para novo envio." },
  { id: "autodeposito", title: "Autodepósito", content: "Após a homologação da ficha e a aprovação do Nada Consta, siga o guia do RI/UFBA. O depósito e a escolha da licença continuam sendo feitos por você no Repositório Institucional." },
];

export default async function FrequentlyAskedQuestionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("frequently_asked_questions").select("id,question,answer").eq("active", true).order("position");
  const faqs = data?.length ? data as Faq[] : fallbackFaqs;
  return <><SiteHeader /><main className="faq-page"><header className="container faq-heading"><p className="eyebrow">Informação e orientação</p><h1>Perguntas frequentes e ajuda</h1><p>Encontre orientações sobre solicitação, análise, liberação da ficha e autodepósito.</p></header><HelpSearch faqs={faqs} help={helpSections} /><section className="container faq-list" aria-label="Perguntas frequentes">{faqs.map((faq) => <details id={`faq-${faq.id}`} key={faq.id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section><section className="container help-section" aria-labelledby="ajuda"><p className="eyebrow">Ajuda por etapa</p><h2 id="ajuda">Siga seu processo com tranquilidade.</h2><div className="help-grid">{helpSections.map((section, index) => <article id={`ajuda-${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{section.title}</h3><p>{section.content}</p></article>)}</div></section><section className="container help-contact" aria-labelledby="contato-ajuda"><div><p className="eyebrow">Fale com a Biblioteca</p><h2 id="contato-ajuda">Ainda precisa de orientação?</h2><p>Para dúvidas sobre o uso do Pronto!, entre em contato com a BIB/FA.</p></div><address><a href="mailto:bibarq@ufba.br">bibarq@ufba.br</a><a href="tel:+557132835888">(71) 3283-5888</a></address></section></main></>;
}
