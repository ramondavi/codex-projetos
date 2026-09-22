"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { logout } from "@/app/auth-actions";
import { DashboardBreadcrumbs } from "./breadcrumbs";

const roleLabels: Record<string, string> = { student: "Estudante", cataloger: "Catalogador", administrator: "Administrador" };

type IconName = "overview" | "queue" | "work" | "admin" | "account" | "request" | "deposit";

const icons: Record<IconName, React.ReactNode> = {
  overview: <><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></>,
  queue: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  work: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V4h8v2M3 12h18M10 12v2h4v-2" /></>,
  admin: <><circle cx="12" cy="8" r="3" /><path d="M5 20c.8-3.5 3-5 7-5s6.2 1.5 7 5M19 6v4M17 8h4" /></>,
  account: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.7 3-5.5 7-5.5s6.3 1.8 7 5.5" /></>,
  request: <><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6M9 16h4" /></>,
  deposit: <><path d="M4 10h16v10H4zM12 3v10M8 9l4 4 4-4" /></>,
};

function SidebarIcon({ name }: { name: IconName }) {
  return <svg className="dashboard-nav__icon" aria-hidden="true" viewBox="0 0 24 24">{icons[name]}</svg>;
}

export function DashboardShell({ children, fullName, role, serviceStatus, serviceStatusIsExceptional }: { children: React.ReactNode; fullName: string; role: string; serviceStatus: string; serviceStatusIsExceptional: boolean }) {
  const isStaff = role === "cataloger" || role === "administrator";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [compact, setCompact] = useState(true);
  const activeClass = (href: string) => {
    const [targetPath, targetQuery] = href.split("?");
    if (targetPath === "/painel/fila" && pathname.startsWith("/painel/atendimento/")) return targetQuery ? undefined : "is-active";
    if (pathname !== targetPath && !(targetPath !== "/painel" && pathname.startsWith(`${targetPath}/`))) return undefined;
    if (!targetQuery) return targetPath === "/painel/fila" && searchParams.get("responsavel") === "me" ? undefined : "is-active";
    const query = new URLSearchParams(targetQuery);
    return [...query.entries()].every(([key, value]) => searchParams.get(key) === value) ? "is-active" : undefined;
  };
  const firstName = fullName.trim().split(/\s+/)[0] || fullName;
  return (
    <div className={`dashboard-shell${compact ? " dashboard-shell--compact" : ""}`}>
      <aside className={`dashboard-nav${compact ? " dashboard-nav--compact" : ""}`}>
        <div className="dashboard-nav__top">
          {compact ? <button className="dashboard-nav__favicon" type="button" onClick={() => setCompact(false)} aria-label="Expandir menu lateral" title="Clique para expandir o menu" data-tooltip="Clique para expandir o menu"><Image src="/icon.png" alt="" width={64} height={64} priority /></button> : <button className="dashboard-nav__brand-toggle" type="button" onClick={() => setCompact(true)} aria-label="Compactar menu lateral" title="Clique para compactar o menu" data-tooltip="Clique para compactar o menu"><span className="dashboard-nav__brand-logo"><Image className="brand__image brand__image--light" src="/logo-pronto-light.png" alt="" width={1600} height={643} priority /><Image className="brand__image brand__image--dark" src="/logo-pronto-dark.png" alt="" width={1600} height={643} priority /></span></button>}
        </div>
        {isStaff ? <nav aria-label="Área da biblioteca">
          <Link className={activeClass("/painel")} href="/painel" aria-label="Visão geral" title="Visão geral"><SidebarIcon name="overview" /><span className="dashboard-nav__label">Visão geral</span></Link>
          <Link className={activeClass("/painel/fila")} href="/painel/fila" aria-label="Fila de solicitações" title="Fila de solicitações"><SidebarIcon name="queue" /><span className="dashboard-nav__label">Fila de solicitações</span></Link>
          <Link className={activeClass("/painel/fila?responsavel=me")} href="/painel/fila?responsavel=me" aria-label="Meus atendimentos" title="Meus atendimentos"><SidebarIcon name="work" /><span className="dashboard-nav__label">Meus atendimentos</span></Link>
          {role === "administrator" && <div className="dashboard-nav__admin"><Link className={activeClass("/painel/admin")} href="/painel/admin?area=operacao" aria-label="Administração" title="Administração"><SidebarIcon name="admin" /><span className="dashboard-nav__label">Administração</span></Link><div className={`dashboard-nav__admin-menu${pathname.startsWith("/painel/admin") ? " is-visible" : ""}`} aria-label="Subseções administrativas"><Link className={activeClass("/painel/admin?area=operacao")} href="/painel/admin?area=operacao">Operação</Link><Link className={activeClass("/painel/admin?area=conteudo")} href="/painel/admin?area=conteudo">Conteúdo</Link><Link className={activeClass("/painel/admin?area=controle")} href="/painel/admin?area=controle">Controle</Link></div></div>}
          <Link className={activeClass("/painel/conta")} href="/painel/conta" aria-label="Minha conta" title="Minha conta"><SidebarIcon name="account" /><span className="dashboard-nav__label">Minha conta</span></Link>
        </nav> : <nav aria-label="Área do estudante">
          <Link className={activeClass("/painel")} href="/painel" aria-label="Visão geral" title="Visão geral"><SidebarIcon name="overview" /><span className="dashboard-nav__label">Visão geral</span></Link>
          <Link className={activeClass("/painel/solicitacao")} href="/painel/solicitacao" aria-label="Minha solicitação" title="Minha solicitação"><SidebarIcon name="request" /><span className="dashboard-nav__label">Minha solicitação</span></Link>
          <Link className={activeClass("/painel/autodeposito")} href="/painel/autodeposito" aria-label="Autodepósito" title="Autodepósito"><SidebarIcon name="deposit" /><span className="dashboard-nav__label">Autodepósito</span></Link>
          <Link className={activeClass("/painel/conta")} href="/painel/conta" aria-label="Minha conta" title="Minha conta"><SidebarIcon name="account" /><span className="dashboard-nav__label">Minha conta</span></Link>
        </nav>}
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div><span className={`status-dot${serviceStatusIsExceptional ? " status-dot--alert" : ""}`} /> {serviceStatus}</div>
          <div className="dashboard-header__actions">
            <div className="user-identity"><span className="user-greeting">Olá, {firstName}</span><span className="user-chip" title={fullName}>{roleLabels[role] ?? role}</span></div>
            <form action={logout}><button className="logout-icon" type="submit" aria-label="Sair da conta" title="Sair da conta"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></svg></button></form>
          </div>
        </header>
        <DashboardBreadcrumbs />
        {children}
      </div>
    </div>
  );
}
