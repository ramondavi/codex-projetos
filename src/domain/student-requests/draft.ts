export const STUDENT_REQUEST_DRAFT_KEY = "pronto:student-request-draft:v2";

export type StudentRequestDraft = {
  academicProgramId: string;
  registrationNumber: string;
  title: string;
  subtitle: string;
  equivalentTitle: string;
  originalLanguage: "pt" | "en" | "es" | "de" | "fr" | "it";
  equivalentTitles: { language: "pt" | "en" | "es" | "de" | "fr" | "it"; title: string }[];
  otherTitles: string[];
  publicWorkUrl: string;
  people: { author: string; additionalAuthors: string[]; committeeMembers: string[]; birthYear: string; birthYearAcknowledged: boolean; advisor: string; advisorNoteLabel: string; coadvisor: string; coadvisorNoteLabel: string };
  keywordsPt: string[];
  keywordsEn: string[];
  specialCases: string[];
  volumeInformation: string;
  depositYear: string;
  defenseYear: string;
  extentUnit: "pages" | "volumes";
  extentCount: string;
  hasIllustrations: "" | "yes" | "no";
  libraryNote: string;
  defendedAndApproved: boolean;
  finalFileConfirmed: boolean;
  approvalPageConfirmed: boolean;
};

export const emptyStudentRequestDraft: StudentRequestDraft = {
  academicProgramId: "",
  registrationNumber: "",
  title: "",
  subtitle: "",
  equivalentTitle: "",
  originalLanguage: "pt",
  equivalentTitles: [{ language: "en", title: "" }],
  otherTitles: [],
  publicWorkUrl: "",
  people: { author: "", additionalAuthors: [], committeeMembers: [], birthYear: "", birthYearAcknowledged: false, advisor: "", advisorNoteLabel: "Orientador", coadvisor: "", coadvisorNoteLabel: "Coorientador" },
  keywordsPt: ["", "", ""],
  keywordsEn: ["", "", ""],
  specialCases: [],
  volumeInformation: "",
  depositYear: String(new Date().getFullYear()),
  defenseYear: "",
  extentUnit: "pages",
  extentCount: "",
  hasIllustrations: "",
  libraryNote: "",
  defendedAndApproved: false,
  finalFileConfirmed: false,
  approvalPageConfirmed: false,
};

export function compactDraft(draft: StudentRequestDraft) {
  const compact = (values: string[]) => values.map((value) => value.trim()).filter(Boolean);
  return {
    ...draft,
    registrationNumber: draft.registrationNumber.trim(),
    title: draft.title.trim(),
    subtitle: draft.subtitle.trim(),
    equivalentTitle: draft.equivalentTitle.trim(),
    equivalentTitles: draft.equivalentTitles.map((item) => ({ ...item, title: item.title.trim() })).filter((item) => item.title),
    publicWorkUrl: draft.publicWorkUrl.trim(),
    otherTitles: compact(draft.otherTitles),
    keywordsPt: compact(draft.keywordsPt),
    keywordsEn: compact(draft.keywordsEn),
    people: {
      author: draft.people.author.trim(),
      additionalAuthors: compact(draft.people.additionalAuthors),
      committeeMembers: compact(draft.people.committeeMembers),
      birthYear: draft.people.birthYear ? Number(draft.people.birthYear) : null,
      birthYearAcknowledged: draft.people.birthYear ? draft.people.birthYearAcknowledged : false,
      advisor: draft.people.advisor.trim(),
      advisorNoteLabel: "Orientador",
      coadvisor: draft.people.coadvisor.trim(),
      coadvisorNoteLabel: draft.people.coadvisor ? "Coorientador" : "",
    },
    depositYear: Number(draft.depositYear),
    defenseYear: Number(draft.defenseYear),
    extentCount: Number(draft.extentCount),
    hasIllustrations: draft.hasIllustrations === "yes",
    volumeInformation: draft.volumeInformation.trim(),
    libraryNote: draft.libraryNote.trim(),
  };
}

/** Accept older local drafts without letting malformed browser data break the form. */
export function restoreStudentRequestDraft(value: unknown): StudentRequestDraft {
  const record = (item: unknown): Record<string, unknown> => item !== null && typeof item === "object" && !Array.isArray(item) ? item as Record<string, unknown> : {};
  const source = record(value);
  const people = record(source.people);
  const restored = structuredClone(emptyStudentRequestDraft);
  for (const key of Object.keys(restored) as (keyof StudentRequestDraft)[]) {
    if (typeof restored[key] === "string" && typeof source[key] === "string") {
      Object.assign(restored, { [key]: source[key] });
    }
  }
  const strings = (item: unknown) => Array.isArray(item) ? item.filter((entry): entry is string => typeof entry === "string") : [];
  for (const key of ["author", "advisor", "coadvisor", "advisorNoteLabel", "coadvisorNoteLabel"] as const) {
    if (typeof people[key] === "string") restored.people[key] = people[key];
  }
  restored.people.birthYear = typeof people.birthYear === "string" || typeof people.birthYear === "number" ? String(people.birthYear) : "";
  restored.people.birthYearAcknowledged = people.birthYearAcknowledged === true;
  restored.people.additionalAuthors = strings(people.additionalAuthors);
  restored.people.committeeMembers = strings(people.committeeMembers);
  const pairedStrings = (item: unknown) => Array.isArray(item) ? item.map((entry) => typeof entry === "string" ? entry : "") : [];
  restored.keywordsPt = pairedStrings(source.keywordsPt);
  restored.keywordsEn = pairedStrings(source.keywordsEn);
  const pairCount = Math.max(3, restored.keywordsPt.length, restored.keywordsEn.length);
  restored.keywordsPt = Array.from({ length: pairCount }, (_, index) => restored.keywordsPt[index] ?? "");
  restored.keywordsEn = Array.from({ length: pairCount }, (_, index) => restored.keywordsEn[index] ?? "");
  restored.otherTitles = strings(source.otherTitles);
  restored.specialCases = strings(source.specialCases).filter((item) => ["cotutelle", "double_degree"].includes(item));
  for (const key of ["defendedAndApproved", "finalFileConfirmed", "approvalPageConfirmed"] as const) restored[key] = source[key] === true;
  const languages = ["pt", "en", "es", "de", "fr", "it"];
  if (!languages.includes(restored.originalLanguage)) restored.originalLanguage = "pt";
  restored.hasIllustrations = source.hasIllustrations === true || source.hasIllustrations === "yes" ? "yes" : source.hasIllustrations === false || source.hasIllustrations === "no" ? "no" : "";
  restored.extentUnit = source.extentUnit === "volumes" ? "volumes" : "pages";
  const titles = Array.isArray(source.equivalentTitles) ? source.equivalentTitles.map(record) : [];
  const seen = new Set<string>();
  restored.equivalentTitles = titles.flatMap((item) => {
    if (typeof item.language !== "string" || !languages.includes(item.language) || item.language === restored.originalLanguage || seen.has(item.language)) return [];
    seen.add(item.language);
    return [{ language: item.language as StudentRequestDraft["originalLanguage"], title: typeof item.title === "string" ? item.title : "" }];
  });
  if (restored.originalLanguage !== "pt") {
    const portuguese = restored.equivalentTitles.find((item) => item.language === "pt") ?? { language: "pt" as const, title: "" };
    restored.equivalentTitles = [portuguese, ...restored.equivalentTitles.filter((item) => item.language !== "pt")];
  } else if (!restored.equivalentTitles.length) {
    restored.equivalentTitles = [{ language: "en", title: restored.equivalentTitle }];
  }
  return restored;
}
