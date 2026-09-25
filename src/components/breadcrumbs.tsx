"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useInterfaceLanguage } from "./interface-language";

const copy = {
  pt: ["Caminho de navegação", "Início", "Central de ajuda", "Política de privacidade", "Acessibilidade", "Visão geral", "Fila de solicitações", "Atendimento", "Ficha catalográfica", "Minha solicitação", "Nova solicitação", "Corrigir solicitação", "Autodepósito", "Administração", "Programas e coordenações", "Minha conta"],
  en: ["Navigation path", "Home", "Help center", "Privacy policy", "Accessibility", "Overview", "Request queue", "Service", "Catalog record", "My request", "New request", "Correct request", "Self-deposit", "Administration", "Programs and coordinators", "My account"],
  es: ["Ruta de navegación", "Inicio", "Centro de ayuda", "Política de privacidad", "Accesibilidad", "Resumen", "Solicitudes", "Atención", "Ficha catalográfica", "Mi solicitud", "Nueva solicitud", "Corregir solicitud", "Autodepósito", "Administración", "Programas y coordinaciones", "Mi cuenta"],
  de: ["Navigationspfad", "Startseite", "Hilfe", "Datenschutzerklärung", "Barrierefreiheit", "Übersicht", "Anfragen", "Bearbeitung", "Katalogeintrag", "Meine Anfrage", "Neue Anfrage", "Anfrage korrigieren", "Selbsteinreichung", "Verwaltung", "Studiengänge und Koordination", "Mein Konto"],
  fr: ["Fil d’Ariane", "Accueil", "Centre d’aide", "Politique de confidentialité", "Accessibilité", "Vue d’ensemble", "Demandes", "Traitement", "Notice de catalogage", "Ma demande", "Nouvelle demande", "Corriger la demande", "Auto-dépôt", "Administration", "Programmes et coordinations", "Mon compte"],
  it: ["Percorso di navigazione", "Home", "Centro assistenza", "Informativa sulla privacy", "Accessibilità", "Panoramica", "Richieste", "Assistenza", "Scheda catalografica", "La mia richiesta", "Nuova richiesta", "Correggi la richiesta", "Autodeposito", "Amministrazione", "Programmi e coordinamenti", "Il mio account"],
};

type Crumb = { label: string; href?: string };

function Trail({ items, variant }: { items: Crumb[]; variant: "public" | "dashboard" }) {
  const { language } = useInterfaceLanguage();
  if (items.length < 2) return null;
  return <nav className={`breadcrumb breadcrumb--${variant}`} aria-label={copy[language][0]}><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href && index < items.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}</li>)}</ol></nav>;
}

export function PublicBreadcrumbs({ articleTitle }: { articleTitle?: string }) {
  const pathname = usePathname();
  const { language } = useInterfaceLanguage(); const t = copy[language];
  if (pathname.startsWith("/ajuda/artigos/") && articleTitle) return <Trail variant="public" items={[{ label: t[1], href: "/" }, { label: t[2], href: "/ajuda" }, { label: articleTitle }]} />;
  const labels: Record<string, string> = { "/ajuda": t[2], "/perguntas-frequentes": t[2], "/politica-de-privacidade": t[3], "/acessibilidade": t[4] };
  const label = labels[pathname];
  return label ? <Trail variant="public" items={[{ label: t[1], href: "/" }, { label }]} /> : null;
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const { language } = useInterfaceLanguage(); const t = copy[language];
  const items: Crumb[] = [{ label: t[5], href: "/painel" }];
  if (pathname === "/painel") return null;
  if (pathname.startsWith("/painel/fila")) items.push({ label: t[6] });
  else if (pathname.startsWith("/painel/atendimento/")) { items.push({ label: t[6], href: "/painel/fila" }, { label: t[7] }); if (pathname.endsWith("/ficha")) items.push({ label: t[8] }); }
  else if (pathname.startsWith("/painel/solicitacao")) { items.push({ label: t[9], href: "/painel/solicitacao" }); if (pathname.endsWith("/nova")) items.push({ label: t[10] }); if (pathname.endsWith("/corrigir")) items.push({ label: t[11] }); }
  else if (pathname.startsWith("/painel/autodeposito")) items.push({ label: t[12] });
  else if (pathname.startsWith("/painel/admin/programas")) items.push({ label: t[13], href: "/painel/admin" }, { label: t[14] });
  else if (pathname.startsWith("/painel/admin")) items.push({ label: t[13] });
  else if (pathname.startsWith("/painel/conta")) items.push({ label: t[15] });
  return <Trail variant="dashboard" items={items} />;
}
