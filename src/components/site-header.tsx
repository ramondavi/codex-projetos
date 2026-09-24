import Link from "next/link";
import { Brand } from "./brand";
import { LibrarySocialLinks } from "./library-social-links";
import { createClient } from "@/lib/supabase/server";
import { PublicBreadcrumbs } from "./breadcrumbs";
import { logout } from "@/app/auth-actions";
import { AppIcon } from "./app-icon";
import { getInterfaceLanguage } from "@/lib/server-language";

const copy = {
  pt: ["Meu painel", "Olá", "Visão geral", "Minha solicitação", "Autodepósito", "Minha conta", "Fila de solicitações", "Meus atendimentos", "Administração", "Navegação principal", "Como funciona", "Central de ajuda", "Sair da conta", "Entrar"],
  en: ["My dashboard", "Hello", "Overview", "My request", "Self-deposit", "My account", "Request queue", "My cases", "Administration", "Main navigation", "How it works", "Help center", "Sign out", "Sign in"],
  es: ["Mi panel", "Hola", "Resumen", "Mi solicitud", "Autodepósito", "Mi cuenta", "Solicitudes", "Mis casos", "Administración", "Navegación principal", "Cómo funciona", "Centro de ayuda", "Cerrar sesión", "Entrar"],
  de: ["Mein Bereich", "Hallo", "Übersicht", "Meine Anfrage", "Selbsteinreichung", "Mein Konto", "Anfragen", "Meine Fälle", "Verwaltung", "Hauptnavigation", "So funktioniert es", "Hilfe", "Abmelden", "Anmelden"],
  fr: ["Mon espace", "Bonjour", "Vue d’ensemble", "Ma demande", "Auto-dépôt", "Mon compte", "Demandes", "Mes dossiers", "Administration", "Navigation principale", "Comment ça marche", "Centre d’aide", "Se déconnecter", "Se connecter"],
  it: ["La mia area", "Ciao", "Panoramica", "La mia richiesta", "Autodeposito", "Il mio account", "Richieste", "I miei casi", "Amministrazione", "Navigazione principale", "Come funziona", "Centro assistenza", "Esci", "Accedi"],
};

export async function SiteHeader() {
  const t = copy[await getInterfaceLanguage()];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle() : { data: null };
  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const accessLabel = t[0];
  const accessGreeting = firstName ? `${t[1]}, ${firstName}` : `${t[1]}!`;
  const accessHref = user ? "/painel" : "/entrar";
  const panelLinks = profile?.role === "student" ? [[t[2], "/painel"], [t[3], "/painel/solicitacao"], [t[4], "/painel/autodeposito"], [t[5], "/painel/conta"]] : [[t[2], "/painel"], [t[6], "/painel/fila"], [t[7], "/painel/fila?responsavel=me"], ...(profile?.role === "administrator" ? [[t[8], "/painel/admin"]] : []), [t[5], "/painel/conta"]];
  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
        <div className="shell-brand"><Brand compact /></div>
        <nav id="menu-principal" aria-label={t[9]} className="site-header__nav" tabIndex={-1}>
          <Link href="/#como-funciona"><AppIcon name="review" />{t[10]}</Link>
          <Link href="/ajuda"><AppIcon name="help" />{t[11]}</Link>
          {user ? <div className="site-header__account"><Link className="site-header__access" href={accessHref} aria-label={`${accessLabel}. ${accessGreeting}`}><AppIcon name="account" /><span className="site-header__access-label">{accessLabel}</span><span className="site-header__access-greeting" aria-hidden="true">{accessGreeting}</span></Link><div className="site-header__submenu">{panelLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<form action={logout}><button className="site-header__logout" type="submit"><AppIcon name="logout" />{t[12]}</button></form></div></div> : <Link className="site-header__access" href={accessHref}><AppIcon name="account" />{t[13]}</Link>}
          <LibrarySocialLinks />
        </nav>
        </div>
      </header>
      <PublicBreadcrumbs />
    </>
  );
}
