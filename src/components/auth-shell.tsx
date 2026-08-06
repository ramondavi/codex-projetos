import Link from "next/link";
import { Brand } from "./brand";
import { Geometry } from "./geometry";
import { ThemeSwitcher } from "./theme-switcher";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <Geometry />
      <div className="auth-shell__top">
        <Brand compact />
        <ThemeSwitcher />
      </div>
      <section className="auth-card">
        <p className="eyebrow">Acesso seguro</p>
        <h1>{title}</h1>
        <p className="auth-card__description">{description}</p>
        {children}
        <Link className="back-link" href="/">← Voltar para a página inicial</Link>
      </section>
    </main>
  );
}
