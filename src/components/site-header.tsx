import Link from "next/link";
import { Brand } from "./brand";
import { ThemeSwitcher } from "./theme-switcher";
import { LibrarySocialLinks } from "./library-social-links";
import { createClient } from "@/lib/supabase/server";
import { PublicBreadcrumbs } from "./breadcrumbs";
import { logout } from "@/app/auth-actions";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle() : { data: null };
  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const accessLabel = user ? `Meu painel${firstName ? ` · ${firstName}` : ""}` : "Entrar";
  const accessHref = user ? "/painel" : "/entrar";
  const panelLinks = profile?.role === "student" ? [["Visão geral", "/painel"], ["Minha solicitação", "/painel/solicitacao"], ["Autodepósito", "/painel/autodeposito"], ["Minha conta", "/painel/conta"]] : [["Visão geral", "/painel"], ["Fila de solicitações", "/painel/fila"], ["Meus atendimentos", "/painel/fila?responsavel=me"], ...(profile?.role === "administrator" ? [["Administração", "/painel/admin"]] : []), ["Minha conta", "/painel/conta"]];
  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
        <div className="shell-brand"><Brand compact /></div>
        <nav aria-label="Navegação principal" className="site-header__nav">
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/perguntas-frequentes">Perguntas frequentes</Link>
          {user ? <><div className="site-header__account"><Link className="site-header__access" href={accessHref}>{accessLabel}</Link><div className="site-header__submenu">{panelLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div><form action={logout}><button className="logout-icon" type="submit" aria-label="Sair da conta" title="Sair da conta"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></svg></button></form></> : <Link className="site-header__access" href={accessHref}>{accessLabel}</Link>}
          <LibrarySocialLinks /><span className="header-divider" aria-hidden="true" /><ThemeSwitcher />
        </nav>
        </div>
      </header>
      <PublicBreadcrumbs />
    </>
  );
}
