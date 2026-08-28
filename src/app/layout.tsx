import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { SiteFooter } from "@/components/site-footer";
import packageInfo from "../../package.json";

export const metadata: Metadata = {
  title: "Pronto! — Assistente de Fichas Catalográficas e Autodepósito",
  description: "Serviço da Biblioteca da Faculdade de Arquitetura da UFBA.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <ThemeScript />
      </head>
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo principal</a>
        <div id="conteudo" tabIndex={-1}>{children}</div>
        <SiteFooter version={packageInfo.version} />
      </body>
    </html>
  );
}
