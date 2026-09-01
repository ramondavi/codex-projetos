import Image from "next/image";

export function OfficialLibraryLogo({ decorative = false, variant = "default" }: { decorative?: boolean; variant?: "header" | "auth" | "sidebar" | "footer" | "default" }) {
  return (
    <span className={`official-library-logo official-library-logo--${variant}`}>
      <Image
        src="/logo-biblioteca-faufba-pronto.png"
        alt={decorative ? "" : "Biblioteca da Faculdade de Arquitetura da UFBA"}
        width={434}
        height={434}
        sizes="(max-width: 560px) 76px, 112px"
      />
    </span>
  );
}
