"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./brand";
import { ThemeSwitcher } from "./theme-switcher";
import { logout } from "@/app/auth-actions";

const roleLabels: Record<string, string> = { student: "Estudante", cataloger: "Catalogador", administrator: "Administrador" };

export function DashboardShell({ children, fullName, role }: { children: React.ReactNode; fullName: string; role: string }) {
  const isStaff = role === "cataloger" || role === "administrator";
  const pathname = usePathname();
  const activeClass = (href: string) => pathname === href || (href !== "/painel" && pathname.startsWith(`${href}/`)) ? "is-active" : undefined;
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-nav">
        <Brand compact />
        {isStaff ? <nav aria-label="Área da biblioteca">
          <Link className={activeClass("/painel/fila")} href="/painel/fila">Fila de solicitações</Link>
          <Link href="/painel/fila?responsavel=me">Meus atendimentos</Link>
          {role === "administrator" && <Link className={activeClass("/painel/admin")} href="/painel/admin">Administração</Link>}
          <Link className={activeClass("/painel/conta")} href="/painel/conta">Minha conta</Link>
        </nav> : <nav aria-label="Área do estudante">
          <Link className={activeClass("/painel")} href="/painel">Visão geral</Link>
          <Link className={activeClass("/painel/solicitacao")} href="/painel/solicitacao">Minha solicitação</Link>
          <Link className={activeClass("/painel/autodeposito")} href="/painel/autodeposito">Autodepósito</Link>
          <Link className={activeClass("/painel/conta")} href="/painel/conta">Minha conta</Link>
        </nav>}
        <p className="dashboard-nav__institution">BIB/FA · SIBI/UFBA</p>
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div><span className="status-dot" /> Atendimento normal</div>
          <div className="dashboard-header__actions">
            <ThemeSwitcher />
            <span className="user-chip" title={fullName}>{roleLabels[role] ?? role}</span>
            <form action={logout}><button className="text-button" type="submit">Sair</button></form>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
