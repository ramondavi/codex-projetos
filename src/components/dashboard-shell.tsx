import Link from "next/link";
import { Brand } from "./brand";
import { ThemeSwitcher } from "./theme-switcher";
import { logout } from "@/app/auth-actions";

const roleLabels: Record<string, string> = { student: "Estudante", cataloger: "Catalogador", administrator: "Administrador" };

export function DashboardShell({ children, fullName, role }: { children: React.ReactNode; fullName: string; role: string }) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-nav">
        <Brand compact />
        <nav aria-label="Área do estudante">
          <Link className="is-active" href="/painel">Visão geral</Link>
          <span aria-disabled="true">Minha solicitação <small>Em breve</small></span>
          <span aria-disabled="true">Autodepósito <small>Em breve</small></span>
          <Link href="/painel/conta">Minha conta</Link>
        </nav>
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
