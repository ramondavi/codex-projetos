"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { logout } from "@/app/auth-actions";
import { DashboardBreadcrumbs } from "./breadcrumbs";
import { AppIcon, type AppIconName } from "./app-icon";

const roleLabels: Record<string, string> = { student: "Estudante", cataloger: "Catalogador", administrator: "Administrador" };

const navIcons: Record<string, AppIconName> = { overview: "home", queue: "queue", work: "work", admin: "admin", account: "account", request: "request", deposit: "upload", panelCollapse: "panelCollapse", panelExpand: "panelExpand" };
function SidebarIcon({ name }: { name: keyof typeof navIcons }) { return <AppIcon className="dashboard-nav__icon" name={navIcons[name]} />; }

export function DashboardShell({ children, fullName, role, serviceStatus, serviceStatusIsExceptional }: { children: React.ReactNode; fullName: string; role: string; serviceStatus: string; serviceStatusIsExceptional: boolean }) {
  const isStaff = role === "cataloger" || role === "administrator";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [compact, setCompact] = useState(true);
  const [adminMenuOpen, setAdminMenuOpen] = useState(() => pathname.startsWith("/painel/admin"));
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
          {compact ? <button className="dashboard-nav__favicon" type="button" onClick={() => setCompact(false)} aria-label="Expandir menu lateral"><Image src="/icon.png" alt="" width={64} height={64} priority /><span className="dashboard-nav__logo-action"><SidebarIcon name="panelExpand" /></span></button> : <button className="dashboard-nav__brand-toggle" type="button" onClick={() => setCompact(true)} aria-label="Compactar menu lateral"><span className="dashboard-nav__brand-logo"><Image className="brand__image brand__image--light" src="/logo-pronto-light.png" alt="" width={1600} height={643} priority /><Image className="brand__image brand__image--dark" src="/logo-pronto-dark.png" alt="" width={1600} height={643} priority /></span><span className="dashboard-nav__logo-action"><SidebarIcon name="panelCollapse" /></span></button>}
        </div>
        {isStaff ? <nav aria-label="Área da biblioteca">
          <Link className={activeClass("/painel")} href="/painel" aria-label="Visão geral" title="Visão geral"><SidebarIcon name="overview" /><span className="dashboard-nav__label">Visão geral</span></Link>
          <Link className={activeClass("/painel/fila")} href="/painel/fila" aria-label="Fila de solicitações" title="Fila de solicitações"><SidebarIcon name="queue" /><span className="dashboard-nav__label">Fila de solicitações</span></Link>
          <Link className={activeClass("/painel/fila?responsavel=me")} href="/painel/fila?responsavel=me" aria-label="Meus atendimentos" title="Meus atendimentos"><SidebarIcon name="work" /><span className="dashboard-nav__label">Meus atendimentos</span></Link>
          {role === "administrator" && <div className="dashboard-nav__admin"><button className={`dashboard-nav__admin-trigger${pathname.startsWith("/painel/admin") ? " is-active" : ""}`} type="button" onClick={() => setAdminMenuOpen((open) => !open)} aria-expanded={adminMenuOpen} aria-controls="submenu-administracao" aria-label="Abrir ou fechar subseções de Administração" title="Administração"><SidebarIcon name="admin" /><span className="dashboard-nav__label">Administração</span></button><div className={`dashboard-nav__admin-menu${adminMenuOpen ? " is-visible" : ""}`} id="submenu-administracao" aria-label="Subseções administrativas"><Link className={activeClass("/painel/admin?area=operacao")} href="/painel/admin?area=operacao">Operação</Link><Link className={activeClass("/painel/admin?area=conteudo")} href="/painel/admin?area=conteudo">Conteúdo</Link><Link className={activeClass("/painel/admin?area=controle")} href="/painel/admin?area=controle">Controle</Link></div></div>}
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
            <form action={logout}><button className="logout-icon" type="submit" aria-label="Sair da conta" title="Sair da conta"><AppIcon name="logout" /></button></form>
          </div>
        </header>
        <DashboardBreadcrumbs />
        {children}
      </div>
    </div>
  );
}
