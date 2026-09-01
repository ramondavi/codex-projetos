export type CardPerson = { role: string; transcribedName: string; authorizedName: string; noteLabel?: string | null; position?: number };
export type CardSubject = { labelPt: string; labelEn?: string | null; isPrimary: boolean; position?: number };

export type CatalogingCardSnapshot = {
  institution: { university: string; librarySystem: string; library: string };
  request: {
    protocol: string; title: string; subtitle?: string | null; equivalentTitle?: string | null;
    otherTitles?: string[]; volumeInformation?: string | null; specialCases?: string[];
    programName: string; academicLevel: string; workNature?: string;
    programTracing?: string | null; depositYear?: number; defenseYear?: number;
    extentUnit?: "pages" | "volumes"; extentCount?: number; hasIllustrations?: boolean;
    publicationPlace?: string;
  };
  people: CardPerson[];
  subjects: CardSubject[];
  classification: { cdu: string; cutter: string };
  technicalResponsibility: { name: string; crb: string };
  catalogingConventions: {
    electronicResourceLabel: string; physicalDescriptionAbbreviation?: string; tracingsLabel?: string;
    pageAbbreviation?: string; volumeAbbreviation?: string; illustrationAbbreviation?: string;
    statementSeparator?: string; academicNoteSeparator?: string; subdivisionSeparator?: string;
  };
  layoutStatus: string;
};

const withoutFinalPunctuation = (value: string) => value.trim().replace(/[\s.;:]+$/u, "");
const sentence = (value: string) => `${withoutFinalPunctuation(value)}.`;
const lowerInitial = (value: string) => value.replace(/\p{L}/u, (letter) => letter.toLocaleLowerCase("pt-BR"));
export const normalizeCutterCode = (value: string) => value.trim().replace(/^(\p{L}+\d+)\p{L}+$/u, "$1");
const slug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function catalogedWorkFilename(snapshot: CatalogingCardSnapshot) {
  const author = snapshot.people.find((person) => person.role === "author");
  const authorized = author?.authorizedName.trim() ?? "";
  const [surnamePart, givenPart] = authorized.includes(",") ? authorized.split(/,(.+)/, 2) : [authorized.split(/\s+/).at(-1) ?? "autor", author?.transcribedName.replace(/\s+\S+$/, "") ?? "autor"];
  return [surnamePart, givenPart, snapshot.request.depositYear ?? "ano", snapshot.request.workNature ?? "trabalho"].map((part) => slug(String(part))).filter(Boolean).join("-") + ".pdf";
}
const normalizeSubdivisionSeparator = (value: string, separator: string) =>
  value.replace(/\s+[–—-]\s+/gu, ` ${separator} `);
const roman = (value: number) => {
  const symbols: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let remaining = value; let result = "";
  for (const [amount, symbol] of symbols) while (remaining >= amount) { result += symbol; remaining -= amount; }
  return result;
};

export function formatProfessionalRegistration(value: string) {
  const normalized = value.trim().match(/^CRB-?(\d+)\/(\d+)$/i);
  return normalized ? `CRB/${normalized[1]}-${normalized[2]}` : value.trim();
}

export function buildCardContent(snapshot: CatalogingCardSnapshot) {
  const author = snapshot.people.find((person) => person.role === "author");
  const advisor = snapshot.people.find((person) => person.role === "advisor");
  const coadvisor = snapshot.people.find((person) => person.role === "coadvisor");
  const title = withoutFinalPunctuation(snapshot.request.title);
  const subtitle = snapshot.request.subtitle ? ` : ${lowerInitial(withoutFinalPunctuation(snapshot.request.subtitle))}` : "";
  const equivalentTitle = snapshot.request.equivalentTitle ? ` = ${withoutFinalPunctuation(snapshot.request.equivalentTitle)}` : "";
  const responsibility = author?.transcribedName ? ` / ${withoutFinalPunctuation(author.transcribedName)}.` : ".";
  const place = snapshot.request.publicationPlace ?? "Salvador";
  const deposit = snapshot.request.depositYear ? ` ${snapshot.catalogingConventions.statementSeparator ?? "—"} ${place}, ${snapshot.request.depositYear}.` : "";
  const titleStatement = `${title} ${snapshot.catalogingConventions.electronicResourceLabel}${subtitle}${equivalentTitle}${responsibility}${deposit}`;
  const extentAbbreviation = snapshot.request.extentUnit === "volumes"
    ? snapshot.catalogingConventions.volumeAbbreviation ?? "v."
    : snapshot.catalogingConventions.pageAbbreviation ?? snapshot.catalogingConventions.physicalDescriptionAbbreviation ?? "p.";
  const physicalDescription = snapshot.request.extentCount
    ? `${snapshot.request.extentCount} ${extentAbbreviation}${snapshot.request.hasIllustrations ? ` : ${snapshot.catalogingConventions.illustrationAbbreviation ?? "il."}` : ""}`
    : "";
  const academicParts = ["Universidade Federal da Bahia", "Faculdade de Arquitetura", snapshot.request.programTracing, snapshot.request.programName]
    .filter((value): value is string => Boolean(value));
  const academicNote = snapshot.request.workNature && snapshot.request.defenseYear
    ? `${snapshot.request.workNature} ${snapshot.catalogingConventions.academicNoteSeparator ?? "–"} ${academicParts.join(", ")}. ${snapshot.request.defenseYear}.`
    : "";
  const notes = [
    advisor ? `${advisor.noteLabel ?? "Orientador"}: ${sentence(advisor.transcribedName)}` : null,
    coadvisor ? `${coadvisor.noteLabel ?? "Coorientador"}: ${sentence(coadvisor.transcribedName)}` : null,
  ].filter((line): line is string => Boolean(line));
  const subdivisionSeparator = snapshot.catalogingConventions.subdivisionSeparator ?? "-";
  const entries = snapshot.subjects.map((subject, index) =>
    `${index + 1}. ${sentence(normalizeSubdivisionSeparator(subject.labelPt, subdivisionSeparator))}`,
  );
  const secondary = [advisor?.authorizedName, coadvisor?.authorizedName].filter((name): name is string => Boolean(name));
  if (snapshot.request.programTracing) secondary.push(`Universidade Federal da Bahia. Faculdade de Arquitetura. ${sentence(snapshot.request.programTracing)}`);
  secondary.push("Título");
  secondary.forEach((name, index) => entries.push(`${roman(index + 1)}. ${sentence(name)}`));
  return {
    authorizedAuthor: author?.authorizedName ? sentence(author.authorizedName) : "",
    titleStatement,
    physicalDescription,
    academicNote,
    notes,
    tracings: entries.join(" "),
    technicalResponsibility: `Responsável técnico: ${snapshot.technicalResponsibility.name} - ${formatProfessionalRegistration(snapshot.technicalResponsibility.crb)}`,
  };
}
