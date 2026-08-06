import Link from "next/link";
import { Brand } from "./brand";
import { ThemeSwitcher } from "./theme-switcher";

export function DashboardShell({ children }: { children: React.ReactNode }) {
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
          <div className="dashboard-header__actions"><ThemeSwitcher /><span className="user-chip">Estudante</span></div>
        </header>
        {children}
      </div>
    </div>
  );
}
