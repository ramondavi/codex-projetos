import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default async function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found-page">
        <section className="container not-found-card" aria-labelledby="not-found-title">
          <p className="eyebrow">Erro 404 · consulta sem resultado</p>
          <div className="not-found-stamp" aria-hidden="true">404</div>
          <h1 id="not-found-title">Esta página saiu da estante.</h1>
          <p>Procuramos no catálogo, entre os rascunhos e até atrás da ficha catalográfica. Nada por aqui.</p>
          <p className="not-found-note">A boa notícia: o Pronto! continua no lugar certo.</p>
          <div className="not-found-actions">
            <Link className="button button--primary" href="/">Voltar ao início</Link>
            <Link className="button button--secondary" href="/perguntas-frequentes">Consultar perguntas frequentes</Link>
          </div>
        </section>
      </main>
    </>
  );
}
