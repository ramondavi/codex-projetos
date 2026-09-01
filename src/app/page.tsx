import Link from "next/link";
import { Geometry } from "@/components/geometry";
import { Notice } from "@/components/notice";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

const steps = [
  ["pencil", "Informe os dados", "Envie os metadados e um link público para a versão final já defendida e aprovada."],
  ["review", "Acompanhe a análise", "A biblioteca confere os dados e indica exatamente os campos que precisam de correção."],
  ["file", "Receba sua ficha", "Após a homologação e a validação do Nada Consta, gere o trabalho completo no seu navegador."],
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
              <Notice />
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
            <h2 className="section__title">Menos repetição. Mais clareza.</h2>
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
      </main>
    </>
  );
}
