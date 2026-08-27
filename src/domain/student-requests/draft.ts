export const STUDENT_REQUEST_DRAFT_KEY = "pronto:student-request-draft:v2";

export type StudentRequestDraft = {
  academicProgramId: string;
  registrationNumber: string;
  title: string;
  subtitle: string;
  equivalentTitle: string;
  otherTitles: string[];
  publicWorkUrl: string;
  people: { author: string; advisor: string; advisorNoteLabel: string; coadvisor: string; coadvisorNoteLabel: string };
  keywordsPt: string[];
  keywordsEn: string[];
  specialCases: string[];
  volumeInformation: string;
  depositYear: string;
  defenseYear: string;
  extentUnit: "pages" | "volumes";
  extentCount: string;
  hasIllustrations: boolean;
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
  otherTitles: [""],
  publicWorkUrl: "",
  people: { author: "", advisor: "", advisorNoteLabel: "Orientador", coadvisor: "", coadvisorNoteLabel: "Coorientador" },
  keywordsPt: [""],
  keywordsEn: [""],
  specialCases: [],
  volumeInformation: "",
  depositYear: String(new Date().getFullYear()),
  defenseYear: "",
  extentUnit: "pages",
  extentCount: "",
  hasIllustrations: false,
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
    publicWorkUrl: draft.publicWorkUrl.trim(),
    otherTitles: compact(draft.otherTitles),
    keywordsPt: compact(draft.keywordsPt),
    keywordsEn: compact(draft.keywordsEn),
    people: {
      author: draft.people.author.trim(),
      advisor: draft.people.advisor.trim(),
      advisorNoteLabel: draft.people.advisorNoteLabel,
      coadvisor: draft.people.coadvisor.trim(),
      coadvisorNoteLabel: draft.people.coadvisor ? draft.people.coadvisorNoteLabel : "",
    },
    depositYear: Number(draft.depositYear),
    defenseYear: Number(draft.defenseYear),
    extentCount: Number(draft.extentCount),
    volumeInformation: draft.volumeInformation.trim(),
    libraryNote: draft.libraryNote.trim(),
  };
}
