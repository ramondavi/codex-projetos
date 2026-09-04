import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { SiteFooter } from "@/components/site-footer";
import packageInfo from "../../package.json";

const metadataBase = new URL("https://prontobib.vercel.app");
const siteTitle = "Pronto! — Assistente de Fichas Catalográficas e Autodepósito";
const siteDescription = "Serviço da Biblioteca da Faculdade de Arquitetura da UFBA para solicitar ficha catalográfica e orientar o autodepósito.";

export const metadata: Metadata = {
  metadataBase,
  title: { default: siteTitle, template: "%s | Pronto!" },
  description: siteDescription,
  applicationName: "Pronto!",
  authors: [{ name: "Biblioteca da Faculdade de Arquitetura — UFBA" }],
  creator: "Biblioteca da Faculdade de Arquitetura — UFBA",
  publisher: "Universidade Federal da Bahia",
  category: "Educação",
  keywords: ["UFBA", "BIB/FA", "Biblioteca da Faculdade de Arquitetura", "ficha catalográfica", "autodepósito", "repositório institucional", "trabalho de conclusão de curso", "dissertação", "tese"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "pt_BR", url: "/", siteName: "Pronto!", title: siteTitle, description: siteDescription, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteTitle }] },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: ["/opengraph-image"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <ThemeScript />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Pronto!", url: metadataBase.toString(), inLanguage: "pt-BR", publisher: { "@type": "Organization", name: "Universidade Federal da Bahia", url: "https://ufba.br" } }) }} />
      </head>
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo principal</a>
        <div id="conteudo" tabIndex={-1}>{children}</div>
        <SiteFooter version={packageInfo.version} />
      </body>
    </html>
  );
}
