import Link from "next/link";

export function SiteFooter({ version }: { version: string }) {
  return <footer className="global-footer" id="creditos">
    <div className="container global-footer__inner">
      <div className="global-footer__top"><strong>Pronto! v{version} · Beta</strong><nav aria-label="Informações"><Link href="/perguntas-frequentes">Perguntas frequentes</Link><Link href="/perguntas-frequentes#ajuda">Ajuda</Link><a href="#creditos">Créditos</a></nav></div>
      <p>Desenvolvido com <span className="footer-heart" role="img" aria-label="amor">♥</span> pelos <span className="credit-tooltip" tabIndex={0} title="Criado pelo bibliotecário Ramon Santana em 2026.">bibliotecários da BIB/FAUFBA</span>. Sistema de código aberto criado em 2026 com a valiosa ajuda do Codex.</p>
      <a className="github-link" href="https://github.com/ramondavi/codex-projetos" target="_blank" rel="noreferrer" aria-label="Repositório do Pronto! no GitHub"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.5 9.5 0 0 1 2.5.34c1.92-1.29 2.76-1.02 2.76-1.02.54 1.37.2 2.39.1 2.64.64.7 1.02 1.59 1.02 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg><span>Ver código-fonte no GitHub</span></a>
    </div>
  </footer>;
}
