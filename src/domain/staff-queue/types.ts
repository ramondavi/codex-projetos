export type QueueRequest = {
  id: string;
  protocol: string;
  status: string;
  title: string;
  subtitle: string | null;
  submittedAt: string;
  updatedAt: string;
  assignedTo: string | null;
  assigneeName: string | null;
  studentName: string;
  registrationNumber: string | null;
  programId: string;
  programName: string;
  programLabel: string;
  monographType: string;
  level: string;
  advisorName: string;
  internalNote: string | null;
  isPriority: boolean;
  priorityReasonCode: string | null;
  priorityReasonDetail: string | null;
  canRevisitDeclarations?: boolean;
  progressLabel: string;
  progressTone: "waiting" | "active" | "ready" | "done" | "attention";
  progressStep: number;
};

export type StaffOption = { id: string; fullName: string };
