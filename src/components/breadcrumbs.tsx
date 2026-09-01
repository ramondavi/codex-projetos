"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Crumb = { label: string; href?: string };

function Trail({ items, variant }: { items: Crumb[]; variant: "public" | "dashboard" }) {
  if (items.length < 2) return null;
  return <nav className={`breadcrumb breadcrumb--${variant}`} aria-label="Caminho de navegação"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href && index < items.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}</li>)}</ol></nav>;
}

export function PublicBreadcrumbs() {
  const pathname = usePathname();
  const labels: Record<string, string> = { "/perguntas-frequentes": "Perguntas frequentes", "/politica-de-privacidade": "Política de privacidade" };
  const label = labels[pathname];
  return label ? <Trail variant="public" items={[{ label: "Início", href: "/" }, { label }]} /> : null;
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const items: Crumb[] = [{ label: "Visão geral", href: "/painel" }];
  if (pathname === "/painel") return null;
  if (pathname.startsWith("/painel/fila")) items.push({ label: "Fila de solicitações" });
  else if (pathname.startsWith("/painel/atendimento/")) { items.push({ label: "Fila de solicitações", href: "/painel/fila" }, { label: "Atendimento" }); if (pathname.endsWith("/ficha")) items.push({ label: "Ficha catalográfica" }); }
  else if (pathname.startsWith("/painel/solicitacao")) { items.push({ label: "Minha solicitação", href: "/painel/solicitacao" }); if (pathname.endsWith("/nova")) items.push({ label: "Nova solicitação" }); if (pathname.endsWith("/corrigir")) items.push({ label: "Corrigir solicitação" }); }
  else if (pathname.startsWith("/painel/autodeposito")) items.push({ label: "Autodepósito" });
  else if (pathname.startsWith("/painel/admin/programas")) items.push({ label: "Administração", href: "/painel/admin" }, { label: "Programas e coordenações" });
  else if (pathname.startsWith("/painel/admin")) items.push({ label: "Administração" });
  else if (pathname.startsWith("/painel/conta")) items.push({ label: "Minha conta" });
  return <Trail variant="dashboard" items={items} />;
}
