import Image from "next/image";

export function OfficialLibraryLogo({ decorative = false }: { decorative?: boolean }) {
  return (
    <span className="official-library-logo">
      <Image
        src="/logo-biblioteca-faufba.png"
        alt={decorative ? "" : "Biblioteca da Faculdade de Arquitetura da UFBA"}
        width={434}
        height={434}
        sizes="(max-width: 560px) 76px, 112px"
      />
    </span>
  );
}
