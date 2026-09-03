"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Brand } from "./brand";
import { ThemeSwitcher } from "./theme-switcher";
import { logout } from "@/app/auth-actions";
import { DashboardBreadcrumbs } from "./breadcrumbs";

const roleLabels: Record<string, string> = { student: "Estudante", cataloger: "Catalogador", administrator: "Administrador" };

export function DashboardShell({ children, fullName, role, serviceStatus, serviceStatusIsExceptional }: { children: React.ReactNode; fullName: string; role: string; serviceStatus: string; serviceStatusIsExceptional: boolean }) {
  const isStaff = role === "cataloger" || role === "administrator";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeClass = (href: string) => {
    const [targetPath, targetQuery] = href.split("?");
    if (targetPath === "/painel/fila" && pathname.startsWith("/painel/atendimento/")) return targetQuery ? undefined : "is-active";
    if (pathname !== targetPath && !(targetPath !== "/painel" && pathname.startsWith(`${targetPath}/`))) return undefined;
    if (!targetQuery) return targetPath === "/painel/fila" && searchParams.get("responsavel") === "me" ? undefined : "is-active";
    return new URLSearchParams(targetQuery).get("responsavel") === searchParams.get("responsavel") ? "is-active" : undefined;
  };
  const firstName = fullName.trim().split(/\s+/)[0] || fullName;
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-nav">
        <Brand compact />
        {isStaff ? <nav aria-label="Área da biblioteca">
          <Link className={activeClass("/painel")} href="/painel">Visão geral</Link>
          <Link className={activeClass("/painel/fila")} href="/painel/fila">Fila de solicitações</Link>
          <Link className={activeClass("/painel/fila?responsavel=me")} href="/painel/fila?responsavel=me">Meus atendimentos</Link>
          {role === "administrator" && <Link className={activeClass("/painel/admin")} href="/painel/admin">Administração</Link>}
          <Link className={activeClass("/painel/conta")} href="/painel/conta">Minha conta</Link>
        </nav> : <nav aria-label="Área do estudante">
          <Link className={activeClass("/painel")} href="/painel">Visão geral</Link>
          <Link className={activeClass("/painel/solicitacao")} href="/painel/solicitacao">Minha solicitação</Link>
          <Link className={activeClass("/painel/autodeposito")} href="/painel/autodeposito">Autodepósito</Link>
          <Link className={activeClass("/painel/conta")} href="/painel/conta">Minha conta</Link>
        </nav>}
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div><span className={`status-dot${serviceStatusIsExceptional ? " status-dot--alert" : ""}`} /> {serviceStatus}</div>
          <div className="dashboard-header__actions">
            <ThemeSwitcher />
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
