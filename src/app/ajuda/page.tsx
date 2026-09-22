import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Ajuda",
  description: "Orientações para solicitar a ficha catalográfica, acompanhar a análise e concluir o autodepósito.",
  alternates: { canonical: "/ajuda" },
};

const sections = [
  { title: "Antes de começar", content: "Tenha em mãos o trabalho final, já defendido ou aprovado pela banca, com a folha de aprovação quando aplicável. O arquivo deve estar disponível por um link público." },
  { title: "Durante a solicitação", content: "Preencha os dados com atenção. O rascunho é salvo automaticamente e pode ser retomado depois. O Pronto! recebe o link do trabalho, não o PDF completo." },
  { title: "Após a análise", content: "Acompanhe o protocolo pelo painel. Se a biblioteca solicitar correções, somente os campos indicados ficarão disponíveis para novo envio." },
  { title: "Autodepósito", content: "Após a homologação da ficha e a aprovação do Nada Consta, siga o guia do RI/UFBA. O depósito e a escolha da licença continuam sendo feitos por você no Repositório Institucional." },
];

export default function HelpPage() {
  return <><SiteHeader /><main className="help-page"><header className="container help-heading"><p className="eyebrow">Orientação</p><h1>Como podemos ajudar?</h1><p>Um guia breve para cada etapa da ficha catalográfica e do autodepósito.</p></header><section className="container help-grid" aria-label="Orientações por etapa">{sections.map((section, index) => <article key={section.title}><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2><p>{section.content}</p></article>)}</section><section className="container help-contact" aria-labelledby="contato-ajuda"><div><p className="eyebrow">Fale com a Biblioteca</p><h2 id="contato-ajuda">Ainda precisa de orientação?</h2><p>Para dúvidas sobre o uso do Pronto!, entre em contato com a BIB/FA.</p></div><address><a href="mailto:bibarq@ufba.br">bibarq@ufba.br</a><a href="tel:+557132835888">(71) 3283-5888</a></address></section><p className="container help-faq-link">Sua dúvida pode já estar respondida nas <Link href="/perguntas-frequentes">perguntas frequentes</Link>.</p></main></>;
}
