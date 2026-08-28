import Link from "next/link";
import { Brand } from "./brand";
import { ThemeSwitcher } from "./theme-switcher";
import { LibrarySocialLinks } from "./library-social-links";
import { createClient } from "@/lib/supabase/server";
import { OfficialLibraryLogo } from "./official-library-logo";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
  const accessLabel = user ? "Meu painel" : "Entrar";
  const accessHref = user ? "/painel" : "/entrar";
  const panelLinks = profile?.role === "student" ? [["Visão geral", "/painel"], ["Minha solicitação", "/painel/solicitacao"], ["Autodepósito", "/painel/autodeposito"], ["Minha conta", "/painel/conta"]] : [["Fila de solicitações", "/painel/fila"], ["Meus atendimentos", "/painel/fila?responsavel=me"], ...(profile?.role === "administrator" ? [["Administração", "/painel/admin"]] : []), ["Minha conta", "/painel/conta"]];
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <div className="shell-brand"><OfficialLibraryLogo decorative variant="header" /><Brand compact /></div>
        <nav aria-label="Navegação principal" className="site-header__nav">
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/perguntas-frequentes">Perguntas frequentes</Link>
          {user ? <div className="site-header__account"><Link className="site-header__access" href={accessHref}>{accessLabel}</Link><div className="site-header__submenu">{panelLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div> : <Link className="site-header__access" href={accessHref}>{accessLabel}</Link>}
          <LibrarySocialLinks /><span className="header-divider" aria-hidden="true" /><ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
