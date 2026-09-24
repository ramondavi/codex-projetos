"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { logout } from "@/app/auth-actions";
import { DashboardBreadcrumbs } from "./breadcrumbs";
import { AppIcon, type AppIconName } from "./app-icon";
import { BackendHelpWidget } from "./backend-help-widget";
import { useInterfaceLanguage } from "./interface-language";

const shellCopy = {
  pt: { student: "Estudante", cataloger: "Catalogador", administrator: "Administrador", overview: "Visão geral", queue: "Fila de solicitações", work: "Meus atendimentos", admin: "Administração", operation: "Operação", content: "Conteúdo", control: "Controle", account: "Minha conta", request: "Minha solicitação", deposit: "Autodepósito", public: "Abrir site público", greeting: "Olá", logout: "Sair da conta", library: "Área da biblioteca", studentArea: "Área do estudante", adminSections: "Subseções administrativas" },
  en: { student: "Student", cataloger: "Cataloger", administrator: "Administrator", overview: "Overview", queue: "Request queue", work: "My cases", admin: "Administration", operation: "Operations", content: "Content", control: "Control", account: "My account", request: "My request", deposit: "Self-deposit", public: "Open public site", greeting: "Hello", logout: "Sign out", library: "Library area", studentArea: "Student area", adminSections: "Administration sections" },
  es: { student: "Estudiante", cataloger: "Catalogador", administrator: "Administrador", overview: "Resumen", queue: "Cola de solicitudes", work: "Mis casos", admin: "Administración", operation: "Operación", content: "Contenido", control: "Control", account: "Mi cuenta", request: "Mi solicitud", deposit: "Autodepósito", public: "Abrir sitio público", greeting: "Hola", logout: "Cerrar sesión", library: "Área de biblioteca", studentArea: "Área de estudiantes", adminSections: "Secciones administrativas" },
  de: { student: "Studierende", cataloger: "Katalogisierer", administrator: "Administrator", overview: "Übersicht", queue: "Anfragen", work: "Meine Fälle", admin: "Verwaltung", operation: "Betrieb", content: "Inhalt", control: "Kontrolle", account: "Mein Konto", request: "Meine Anfrage", deposit: "Selbsteinreichung", public: "Öffentliche Seite öffnen", greeting: "Hallo", logout: "Abmelden", library: "Bibliotheksbereich", studentArea: "Studierendenbereich", adminSections: "Verwaltungsbereiche" },
  fr: { student: "Étudiant", cataloger: "Catalogueur", administrator: "Administrateur", overview: "Vue d’ensemble", queue: "Demandes", work: "Mes dossiers", admin: "Administration", operation: "Opérations", content: "Contenu", control: "Contrôle", account: "Mon compte", request: "Ma demande", deposit: "Auto-dépôt", public: "Ouvrir le site public", greeting: "Bonjour", logout: "Se déconnecter", library: "Espace bibliothèque", studentArea: "Espace étudiant", adminSections: "Rubriques administratives" },
  it: { student: "Studente", cataloger: "Catalogatore", administrator: "Amministratore", overview: "Panoramica", queue: "Richieste", work: "I miei casi", admin: "Amministrazione", operation: "Operazioni", content: "Contenuto", control: "Controllo", account: "Il mio account", request: "La mia richiesta", deposit: "Autodeposito", public: "Apri sito pubblico", greeting: "Ciao", logout: "Esci", library: "Area biblioteca", studentArea: "Area studenti", adminSections: "Sezioni amministrative" },
};

const navIcons: Record<string, AppIconName> = { overview: "home", queue: "queue", work: "work", admin: "admin", account: "account", request: "request", deposit: "upload", panelCollapse: "panelCollapse", panelExpand: "panelExpand" };
function SidebarIcon({ name }: { name: keyof typeof navIcons }) { return <AppIcon className="dashboard-nav__icon" name={navIcons[name]} />; }

export function DashboardShell({ children, fullName, role, serviceStatus, serviceStatusIsExceptional }: { children: React.ReactNode; fullName: string; role: string; serviceStatus: string; serviceStatusIsExceptional: boolean }) {
  const isStaff = role === "cataloger" || role === "administrator";
  const pathname = usePathname();
  const { language } = useInterfaceLanguage();
  const t = shellCopy[language];
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(() => pathname.startsWith("/painel/admin"));
  useEffect(() => { if (pathname.startsWith("/painel/admin")) setAdminMenuOpen(true); }, [pathname]);
  const adminMenuVisible = adminMenuOpen;
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
    <div className="dashboard-shell dashboard-shell--compact">
      <aside className={`dashboard-nav${expanded ? "" : " dashboard-nav--compact"}`} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)} onFocusCapture={() => setExpanded(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }}>
        <div className="dashboard-nav__top">
          <Link href="/" className="dashboard-nav__logo-link" aria-label={t.public} title={t.public}><span className="dashboard-nav__favicon"><Image src="/icon.png" alt="" width={64} height={64} priority /></span><span className="dashboard-nav__brand-logo"><Image className="brand__image brand__image--light" src="/logo-pronto-light.png" alt="" width={1600} height={643} priority /><Image className="brand__image brand__image--dark" src="/logo-pronto-dark.png" alt="" width={1600} height={643} priority /></span></Link>
        </div>
        {isStaff ? <nav aria-label={t.library}>
          <Link className={activeClass("/painel")} href="/painel" aria-label={t.overview} title={t.overview}><SidebarIcon name="overview" /><span className="dashboard-nav__label">{t.overview}</span></Link>
          <Link className={activeClass("/painel/fila")} href="/painel/fila" aria-label={t.queue} title={t.queue}><SidebarIcon name="queue" /><span className="dashboard-nav__label">{t.queue}</span></Link>
          <Link className={activeClass("/painel/fila?responsavel=me")} href="/painel/fila?responsavel=me" aria-label={t.work} title={t.work}><SidebarIcon name="work" /><span className="dashboard-nav__label">{t.work}</span></Link>
          {role === "administrator" && <div className="dashboard-nav__admin"><button className={`dashboard-nav__admin-trigger${pathname.startsWith("/painel/admin") ? " is-active" : ""}`} type="button" onClick={() => setAdminMenuOpen((open) => !open)} aria-expanded={adminMenuVisible} aria-controls="submenu-administracao" aria-label="Abrir ou fechar subseções de Administração" title={t.admin}><SidebarIcon name="admin" /><span className="dashboard-nav__label">{t.admin}</span></button><div className={`dashboard-nav__admin-menu${adminMenuVisible ? " is-visible" : ""}`} id="submenu-administracao" aria-label={t.adminSections}><Link className={activeClass("/painel/admin?area=operacao")} href="/painel/admin?area=operacao">{t.operation}</Link><Link className={activeClass("/painel/admin?area=conteudo")} href="/painel/admin?area=conteudo">{t.content}</Link><Link className={activeClass("/painel/admin?area=controle")} href="/painel/admin?area=controle">{t.control}</Link></div></div>}
          <Link className={activeClass("/painel/conta")} href="/painel/conta" aria-label={t.account} title={t.account}><SidebarIcon name="account" /><span className="dashboard-nav__label">{t.account}</span></Link>
        </nav> : <nav aria-label={t.studentArea}>
          <Link className={activeClass("/painel")} href="/painel" aria-label={t.overview} title={t.overview}><SidebarIcon name="overview" /><span className="dashboard-nav__label">{t.overview}</span></Link>
          <Link className={activeClass("/painel/solicitacao")} href="/painel/solicitacao" aria-label={t.request} title={t.request}><SidebarIcon name="request" /><span className="dashboard-nav__label">{t.request}</span></Link>
          <Link className={activeClass("/painel/autodeposito")} href="/painel/autodeposito" aria-label={t.deposit} title={t.deposit}><SidebarIcon name="deposit" /><span className="dashboard-nav__label">{t.deposit}</span></Link>
          <Link className={activeClass("/painel/conta")} href="/painel/conta" aria-label={t.account} title={t.account}><SidebarIcon name="account" /><span className="dashboard-nav__label">{t.account}</span></Link>
        </nav>}
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div><span className={`status-dot${serviceStatusIsExceptional ? " status-dot--alert" : ""}`} /> {serviceStatus}</div>
          <div className="dashboard-header__actions">
            <div className="user-identity"><span className="user-greeting">{t.greeting}, {firstName}</span><span className="user-chip" title={fullName}>{t[role as keyof typeof t] ?? role}</span></div>
            <form action={logout}><button className="logout-icon" type="submit" aria-label={t.logout} title={t.logout}><AppIcon name="logout" /></button></form>
          </div>
        </header>
        <DashboardBreadcrumbs />
        {children}
        <BackendHelpWidget role={role} />
      </div>
    </div>
  );
}
