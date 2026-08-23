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
};

export type StaffOption = { id: string; fullName: string };
