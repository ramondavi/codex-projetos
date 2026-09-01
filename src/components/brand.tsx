import Link from "next/link";
import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Pronto! — Página inicial">
      <span className="brand__logo"><Image className="brand__image brand__image--light" src="/logo-pronto-light.png" alt="Pronto! Biblioteca FAUFBA" width={1600} height={643} priority /><Image className="brand__image brand__image--dark" src="/logo-pronto-dark.png" alt="" width={1600} height={643} priority /></span>
    </Link>
  );
}
