import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acessibilidade",
  description: "Recursos de acessibilidade e formas de contato do Pronto!.",
  alternates: { canonical: "/acessibilidade" },
};

export default function AccessibilityPage() {
  return <><SiteHeader /><main className="accessibility-page"><header className="container accessibility-page__hero">
    <p className="eyebrow">Acessibilidade digital</p><h1>Um Pronto! mais simples de usar.</h1>
    <p>O Pronto! foi construído para funcionar com teclado, diferentes tamanhos de texto, contraste elevado e tecnologias assistivas.</p>
  </header><section className="container accessibility-page__content" aria-label="Recursos de acessibilidade">
    <h2>Atalhos e recursos</h2>
    <ul>
      <li><strong>Alt + 1:</strong> vai direto ao conteúdo principal.</li>
      <li><strong>Alt + 2:</strong> vai ao menu principal.</li>
      <li><strong>Alt + 4:</strong> ativa ou desativa o alto contraste.</li>
      <li><strong>Alt + 5:</strong> abre esta página.</li>
    </ul>
    <p>Em alguns navegadores, o atalho pode incluir <strong>Shift</strong> ou outra tecla adicional. Os links e botões também podem ser usados normalmente com Tab, Enter e Espaço.</p>
    <h2>Visualização</h2>
    <p>A barra no topo oferece controles para aumentar ou reduzir o texto e para ativar alto contraste. Essas preferências ficam salvas apenas neste navegador.</p>
    <h2>Libras</h2>
    <p>Quando a Barra Brasil oficial está ativa, o recurso VLibras é disponibilizado por ela. O Pronto! não coleta dados desse recurso.</p>
    <h2>Encontrou uma barreira?</h2>
    <p>Conte para a Biblioteca da Faculdade de Arquitetura pelo e-mail <a href="mailto:bibarq@ufba.br">bibarq@ufba.br</a>, descrevendo a página e o que tentou fazer. Vamos analisar e buscar uma solução.</p>
  </section></main></>;
}
