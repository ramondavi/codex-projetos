export type QueueRequest = {
  id: string;
  protocol: string;
  status: string;
  title: string;
  submittedAt: string;
  assignedTo: string | null;
  assigneeName: string | null;
  studentName: string;
  programId: string;
  programName: string;
  level: string;
  advisorName: string;
  hasInternalNote: boolean;
  progressLabel: string;
  progressTone: "waiting" | "active" | "ready" | "done" | "attention";
};

export type StaffOption = { id: string; fullName: string };
