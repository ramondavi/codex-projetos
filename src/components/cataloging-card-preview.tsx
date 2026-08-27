import { buildCardContent, normalizeCutterCode, type CatalogingCardSnapshot } from "@/domain/cataloging-card/types";

export function CatalogingCardPreview({ snapshot, live = false }: { snapshot: CatalogingCardSnapshot; live?: boolean }) {
  const content = buildCardContent(snapshot);
  return <section className="cataloging-card-preview" aria-live={live ? "polite" : undefined}>
    {live && <div className="cataloging-card-preview__label"><strong>Prévia em tempo real</strong><span>Atualizada durante a edição</span></div>}
    <article className="cataloging-card" aria-label="Prévia da ficha catalográfica">
      <header><strong>Dados Internacionais de Catalogação na Publicação (CIP)</strong><strong>{snapshot.institution.university}</strong><strong>{snapshot.institution.librarySystem}</strong><strong>{snapshot.institution.library}</strong></header>
      <div className="cataloging-card__body"><span className="cataloging-card__cutter">{normalizeCutterCode(snapshot.classification.cutter)}</span><div className="cataloging-card__content"><p className="cataloging-card__authorized">{content.authorizedAuthor}</p><p>{content.titleStatement}</p>{content.physicalDescription && <p>{content.physicalDescription}</p>}{content.academicNote && <p className="cataloging-card__spaced">{content.academicNote}</p>}{content.notes.map((note) => <p key={note}>{note}</p>)}<p className="cataloging-card__spaced">{content.tracings}</p><p className="cataloging-card__cdu">CDU: {snapshot.classification.cdu}</p></div></div>
      <footer>{content.technicalResponsibility}</footer>
    </article>
  </section>;
}
