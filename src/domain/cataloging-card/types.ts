export type CardPerson = { role: string; transcribedName: string; authorizedName: string; position?: number };
export type CardSubject = { labelPt: string; labelEn?: string | null; isPrimary: boolean; position?: number };

export type CatalogingCardSnapshot = {
  institution: { university: string; librarySystem: string; library: string };
  request: {
    protocol: string; title: string; subtitle?: string | null; equivalentTitle?: string | null;
    otherTitles?: string[]; volumeInformation?: string | null; specialCases?: string[];
    programName: string; academicLevel: string;
  };
  people: CardPerson[];
  subjects: CardSubject[];
  classification: { cdu: string; cutter: string };
  technicalResponsibility: { name: string; crb: string };
  catalogingConventions: { electronicResourceLabel: string; physicalDescriptionAbbreviation: string; tracingsLabel: string };
  layoutStatus: string;
};

export function buildCardContent(snapshot: CatalogingCardSnapshot) {
  const author = snapshot.people.find((person) => person.role === "author");
  const advisor = snapshot.people.find((person) => person.role === "advisor");
  const coadvisor = snapshot.people.find((person) => person.role === "coadvisor");
  const titleParts = [snapshot.request.title, snapshot.request.subtitle ? `: ${snapshot.request.subtitle}` : "", snapshot.request.equivalentTitle ? ` = ${snapshot.request.equivalentTitle}` : ""].join("");
  const responsibility = author?.transcribedName ? ` / ${author.transcribedName}.` : ".";
  const notes = [
    advisor ? `Orientador: ${advisor.transcribedName}.` : null,
    coadvisor ? `Coorientador: ${coadvisor.transcribedName}.` : null,
    snapshot.request.volumeInformation ? `Volumes: ${snapshot.request.volumeInformation}.` : null,
    snapshot.request.otherTitles?.length ? `Outros títulos: ${snapshot.request.otherTitles.join("; ")}.` : null,
  ].filter((line): line is string => Boolean(line));
  const subjectEntries = snapshot.subjects.map((subject, index) => `${index + 1}. ${subject.labelPt}.`);
  const secondaryNames = [advisor?.authorizedName, coadvisor?.authorizedName, "Título"].filter((name): name is string => Boolean(name));
  const secondaryEntries = secondaryNames.map((name, index) => `${["I", "II", "III"][index]}. ${name}.`);
  return {
    authorizedAuthor: author?.authorizedName ?? "",
    titleStatement: `${titleParts}${responsibility} – ${snapshot.catalogingConventions.electronicResourceLabel}.`,
    notes,
    tracings: `${snapshot.catalogingConventions.tracingsLabel}: ${[...subjectEntries, ...secondaryEntries].join(" ")}`,
  };
}
