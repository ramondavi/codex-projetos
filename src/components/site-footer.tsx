import Link from "next/link";
import Image from "next/image";
import { OfficialLibraryLogo } from "@/components/official-library-logo";
import { AppIcon } from "@/components/app-icon";
import styles from "./site-footer.module.css";

export function SiteFooter({ version }: { version: string }) {
  return (
    <footer className={styles.footer} id="creditos">
      <div className={styles.inner}>
        <div className={styles.signature}>
          <div className={styles.libraryBrand}><OfficialLibraryLogo variant="footer" /></div>
          <p>Fichas catalográficas e autodepósito</p>
        </div>
        <nav className={styles.navigation} aria-label="Informações">
          <Link href="/ajuda#perguntas-frequentes">Perguntas frequentes</Link>
          <Link href="/ajuda">Central de ajuda</Link>
          <Link href="/politica-de-privacidade">Privacidade</Link>
          <Link href="/acessibilidade">Acessibilidade</Link>
        </nav>
        <div className={styles.institutions} aria-label="Instituições">
          <a href="https://ufba.br" target="_blank" rel="noreferrer"><Image src="/brasao-ufba.png" alt="Universidade Federal da Bahia" width={1135} height={1739} /></a>
          <a href="https://sibi.ufba.br" target="_blank" rel="noreferrer"><Image src="/logo-sibi.png" alt="Sistema Universitário de Bibliotecas da UFBA" width={2876} height={850} /></a>
          <a href="https://arquitetura.ufba.br" target="_blank" rel="noreferrer"><Image src="/logo-faufba.png" alt="Faculdade de Arquitetura da UFBA" width={230} height={205} /></a>
        </div>
        <p className={styles.credit}>Feito pelos bibliotecários da BIB/FAUFBA com <a href="https://openai.com/pt-BR/codex/" target="_blank" rel="noreferrer">vibe coding</a> e <span aria-label="amor" role="img">♥</span>.</p>
        <div className={styles.meta}>
          <span>2026 · v{version} · Beta</span>
          <a href="https://github.com/ramondavi/codex-projetos" target="_blank" rel="noreferrer"><AppIcon name="github" />Código aberto no GitHub ↗</a>
          <span>Licença AGPL-3.0</span>
        </div>
      </div>
    </footer>
  );
}
