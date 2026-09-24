import Image from "next/image";

export function OfficialLibraryLogo({ decorative = false, variant = "default" }: { decorative?: boolean; variant?: "header" | "auth" | "sidebar" | "footer" | "default" }) {
  return (
    <a className={`official-library-logo official-library-logo--${variant}`} href="https://arquitetura.ufba.br/pt-br/sobre-0" target="_blank" rel="noreferrer" aria-label={decorative ? "Biblioteca da Faculdade de Arquitetura da UFBA" : undefined}>
      <Image
        className="official-library-logo__light"
        src="/logo-biblioteca-faufba-pronto.png"
        alt={decorative ? "" : "Biblioteca da Faculdade de Arquitetura da UFBA"}
        width={434}
        height={434}
        sizes="(max-width: 560px) 76px, 112px"
      />
      <Image className="official-library-logo__dark" src="/logo-biblioteca-faufba-pronto-dark-v2.png" alt="" aria-hidden="true" width={334} height={161} sizes="(max-width: 560px) 76px, 112px" />
    </a>
  );
}
