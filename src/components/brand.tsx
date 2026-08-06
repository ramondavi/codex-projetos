import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Pronto! — Página inicial">
      <span className="brand__name">Pronto!</span>
      {!compact && <span className="brand__subtitle">Assistente de Fichas Catalográficas e Autodepósito</span>}
    </Link>
  );
}
