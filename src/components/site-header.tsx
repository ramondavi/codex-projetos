import Link from "next/link";
import { Brand } from "./brand";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand compact />
        <nav aria-label="Navegação principal" className="site-header__nav">
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/entrar">Entrar</Link>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
