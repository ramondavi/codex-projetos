import Link from "next/link";
import { Geometry } from "@/components/geometry";
import { Notice } from "@/components/notice";
import { ClarityHeading } from "@/components/clarity-heading";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { isCurrentServiceAnnouncement } from "@/lib/service-announcements";

const steps = [
  ["pencil", "Informe os dados", "Envie os metadados e um link público para a versão final já defendida e aprovada."],
  ["review", "Acompanhe a análise", "A biblioteca confere os dados e indica exatamente os campos que precisam de correção."],
  ["file", "Receba sua ficha", "Após a homologação e a validação do Nada Consta, gere o trabalho completo no seu navegador."],
];
const fallbackHomeFaqs = [
  { id: "fallback-home-1", question: "Quem pode usar o Pronto!?", answer: "Estudantes da UFBA que precisam solicitar ficha catalográfica e realizar o autodepósito, além da equipe autorizada da BIB/FA." },
  { id: "fallback-home-2", question: "O trabalho completo é enviado ao Pronto!?", answer: "Não. O estudante informa um link público para análise e o PDF completo permanece no próprio dispositivo durante a mesclagem da ficha." },
  { id: "fallback-home-3", question: "Quando posso baixar a ficha?", answer: "Depois que a ficha for homologada pela biblioteca e o Nada Consta for aprovado." },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: faqs } = await supabase.from("frequently_asked_questions").select("id,question,answer,position,featured_position").eq("active", true).order("position");
  const featuredFaqs = faqs?.filter((faq) => faq.featured_position !== null).sort((a, b) => (a.featured_position ?? 0) - (b.featured_position ?? 0));
  const homeFaqs = featuredFaqs?.length ? featuredFaqs : faqs?.slice(0, 3).length ? faqs.slice(0, 3) : fallbackHomeFaqs;
  const now = new Date().toISOString();
  const { data: announcements } = await supabase.from("library_announcements").select("title,message,type,starts_at,ends_at").eq("active", true).neq("type", "normal").lte("starts_at", now).or(`ends_at.is.null,ends_at.gte.${now}`).order("starts_at", { ascending: false });
  const currentAnnouncement = announcements?.find((announcement) => isCurrentServiceAnnouncement(announcement, now));
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <Geometry />
          <div className="container hero__grid">
            <div className="hero__content">
              <p className="eyebrow">Biblioteca da Faculdade de Arquitetura · UFBA</p>
              <p className="hero__lead">Assistente de Fichas Catalográficas e Autodepósito</p>
              <p className="hero__description">Um fluxo claro e seguro para concluir sua ficha catalográfica com acompanhamento profissional da BIB/FAUFBA.</p>
              {!user && <div className="actions"><Link className="button button--primary" href="/entrar">Entrar no Pronto!</Link><Link className="button button--secondary" href="/cadastro">Criar conta</Link></div>}
            </div>
            <div className="hero__aside">
              <Notice announcement={currentAnnouncement} />
              <div className="requirements">
                <p className="eyebrow">Antes de começar</p>
                <h2>Seu trabalho precisa estar concluído.</h2>
                <ul>
                  <li>Apresentado ou defendido e aprovado por banca</li>
                  <li>Versão final com folha de aprovação, quando aplicável</li>
                  <li>Disponível por um link público de nuvem</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="section section--muted">
          <div className="container">
            <p className="eyebrow">Como funciona</p>
            <ClarityHeading />
            <div className="steps">
              {steps.map(([icon, title, description]) => (
                <article className="step" key={icon}>
                  <span className={`step__icon step__icon--${icon}`} aria-hidden="true">{icon === "pencil" ? "✎" : icon === "review" ? "✓" : "↗"}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section home-faq">
          <div className="container">
            <p className="eyebrow">Dúvidas frequentes</p>
            <h2 className="section__title section__title--single-line">Respostas antes de começar.</h2>
            <div className="home-faq__list">
              {homeFaqs.map((faq) => <article key={faq.id}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}
            </div>
            <Link className="button button--secondary" href="/perguntas-frequentes">Outras dúvidas</Link>
          </div>
        </section>
      </main>
    </>
  );
}
