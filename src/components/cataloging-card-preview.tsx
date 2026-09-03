import { buildCardContent, normalizeCutterCode, prefixBeforeFourthAuthorLetter, type CatalogingCardSnapshot } from "@/domain/cataloging-card/types";

export function CatalogingCardPreview({ snapshot, live = false }: { snapshot: CatalogingCardSnapshot; live?: boolean }) {
  const content = buildCardContent(snapshot);
  const anchor = prefixBeforeFourthAuthorLetter(content.authorizedAuthor);
  const hanging = (value: string, className?: string) => <p key={value} className={className}><span aria-hidden="true" className="cataloging-card__hanging-anchor">{anchor}</span>{value}</p>;
  return <section className="cataloging-card-preview" aria-live={live ? "polite" : undefined}>
    {live && <div className="cataloging-card-preview__label"><strong>Prévia em tempo real</strong><span>Atualizada durante a edição</span></div>}
    <article className="cataloging-card" aria-label="Prévia da ficha catalográfica">
      <header><strong>Dados Internacionais de Catalogação na Publicação (CIP)</strong><strong>{snapshot.institution.university}</strong><strong>{snapshot.institution.librarySystem}</strong><strong>{snapshot.institution.library}</strong></header>
      <div className="cataloging-card__body"><span className="cataloging-card__cutter">{normalizeCutterCode(snapshot.classification.cutter)}</span><div className="cataloging-card__content"><p className="cataloging-card__authorized">{content.authorizedAuthor}</p>{hanging(content.titleStatement)}{content.physicalDescription && hanging(content.physicalDescription)}{content.academicNote && hanging(content.academicNote, "cataloging-card__spaced")}{content.notes.map((note) => hanging(note))}{hanging(content.tracings, "cataloging-card__spaced")}<p className="cataloging-card__cdu">CDU: {snapshot.classification.cdu}</p></div></div>
      <footer>{content.technicalResponsibility}</footer>
    </article>
  </section>;
}
