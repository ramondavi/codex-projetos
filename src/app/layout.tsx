import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { SiteFooter } from "@/components/site-footer";
import packageInfo from "../../package.json";

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"));

export const metadata: Metadata = {
  metadataBase,
  title: { default: "Pronto! — Assistente de Fichas Catalográficas e Autodepósito", template: "%s | Pronto!" },
  description: "Serviço da Biblioteca da Faculdade de Arquitetura da UFBA.",
  applicationName: "Pronto!",
  keywords: ["UFBA", "BIB/FA", "ficha catalográfica", "autodepósito", "repositório institucional"],
  openGraph: { type: "website", locale: "pt_BR", siteName: "Pronto!", title: "Pronto! — Assistente de Fichas Catalográficas e Autodepósito", description: "Serviço da Biblioteca da Faculdade de Arquitetura da UFBA." },
  twitter: { card: "summary_large_image", title: "Pronto! — Assistente de Fichas Catalográficas e Autodepósito", description: "Serviço da Biblioteca da Faculdade de Arquitetura da UFBA." },
  robots: { index: true, follow: true },
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
