import Link from "next/link";
import { Brand } from "./brand";
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
        <nav id="menu-principal" aria-label="Navegação principal" className="site-header__nav" tabIndex={-1}>
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/perguntas-frequentes">Perguntas frequentes</Link>
          {user ? <div className="site-header__account"><Link className="site-header__access" href={accessHref}>{accessLabel}</Link><div className="site-header__submenu">{panelLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<form action={logout}><button className="site-header__logout" type="submit">↗ Sair da conta</button></form></div></div> : <Link className="site-header__access" href={accessHref}>{accessLabel}</Link>}
          <LibrarySocialLinks />
        </nav>
        </div>
      </header>
      <PublicBreadcrumbs />
    </>
  );
}
