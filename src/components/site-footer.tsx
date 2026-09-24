"use client";

import Link from "next/link";
import Image from "next/image";
import { OfficialLibraryLogo } from "@/components/official-library-logo";
import { AppIcon } from "@/components/app-icon";
import styles from "./site-footer.module.css";
import { LanguageControl } from "./language-control";
import { useInterfaceLanguage } from "./interface-language";

const footerCopy = {
  pt: ["Fichas catalográficas e autodepósito", "Central de ajuda", "Privacidade", "Acessibilidade", "Feito pelos bibliotecários da BIB/FAUFBA com", "e", "amor", "Código aberto no GitHub", "Licença"],
  en: ["Catalog records and self-deposit", "Help center", "Privacy", "Accessibility", "Made by the BIB/FAUFBA librarians with", "and", "love", "Open source on GitHub", "License"],
  es: ["Fichas catalográficas y autodepósito", "Centro de ayuda", "Privacidad", "Accesibilidad", "Creado por los bibliotecarios de BIB/FAUFBA con", "y", "amor", "Código abierto en GitHub", "Licencia"],
  de: ["Katalogeinträge und Selbsteinreichung", "Hilfe", "Datenschutz", "Barrierefreiheit", "Erstellt von der BIB/FAUFBA-Bibliothek mit", "und", "Liebe", "Quellcode auf GitHub", "Lizenz"],
  fr: ["Notices de catalogage et auto-dépôt", "Centre d’aide", "Confidentialité", "Accessibilité", "Créé par les bibliothécaires de la BIB/FAUFBA avec", "et", "amour", "Code source sur GitHub", "Licence"],
  it: ["Schede catalografiche e autodeposito", "Centro assistenza", "Privacy", "Accessibilità", "Creato dai bibliotecari BIB/FAUFBA con", "e", "amore", "Codice su GitHub", "Licenza"],
};

export function SiteFooter({ version }: { version: string }) {
  const { language } = useInterfaceLanguage();
  const t = footerCopy[language];
  return (
    <footer className={styles.footer} id="creditos">
      <div className={styles.inner}>
        <div className={styles.signature}>
          <div className={styles.libraryBrand}><OfficialLibraryLogo variant="footer" /></div>
          <p>{t[0]}</p>
        </div>
        <nav className={styles.navigation} aria-label="Informações">
          <Link href="/ajuda">{t[1]}</Link>
          <Link href="/politica-de-privacidade">{t[2]}</Link>
          <Link href="/acessibilidade">{t[3]}</Link>
        </nav>
        <div className={styles.institutions} aria-label="Instituições">
          <a href="https://ufba.br" target="_blank" rel="noreferrer"><Image src="/brasao-ufba.png" alt="Universidade Federal da Bahia" width={1135} height={1739} /></a>
          <a href="https://sibi.ufba.br" target="_blank" rel="noreferrer"><Image src="/logo-sibi.png" alt="Sistema Universitário de Bibliotecas da UFBA" width={2876} height={850} /></a>
          <a href="https://arquitetura.ufba.br" target="_blank" rel="noreferrer"><Image src="/logo-faufba.png" alt="Faculdade de Arquitetura da UFBA" width={230} height={205} /></a>
        </div>
        <p className={styles.credit}>{t[4]} <a href="https://openai.com/pt-BR/codex/" target="_blank" rel="noreferrer">vibe coding</a> {t[5]} <span aria-label={t[6]} role="img">♥</span>.</p>
        <div className={styles.meta}>
          <span>2026 · v{version} · Beta</span>
          <a href="https://github.com/ramondavi/codex-projetos" target="_blank" rel="noreferrer"><AppIcon name="github" />{t[7]} ↗</a>
          <span>{t[8]} AGPL-3.0</span>
        </div>
        <LanguageControl />
      </div>
    </footer>
  );
}
