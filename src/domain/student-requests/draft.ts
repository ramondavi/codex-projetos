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
  people: { author: string; additionalAuthors: string[]; birthYear: string; birthYearAcknowledged: boolean; advisor: string; advisorNoteLabel: string; coadvisor: string; coadvisorNoteLabel: string };
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
  people: { author: "", additionalAuthors: [], birthYear: "", birthYearAcknowledged: false, advisor: "", advisorNoteLabel: "Orientador", coadvisor: "", coadvisorNoteLabel: "Coorientador" },
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
