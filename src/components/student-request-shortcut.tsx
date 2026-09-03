"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STUDENT_REQUEST_DRAFT_KEY } from "@/domain/student-requests/draft";

export function StudentRequestShortcut({ className, emptyLabel = "Iniciar solicitação" }: { className?: string; emptyLabel?: string }) {
  const [hasDraft, setHasDraft] = useState(false);
  useEffect(() => {
    try { setHasDraft(Boolean(localStorage.getItem(STUDENT_REQUEST_DRAFT_KEY))); } catch { setHasDraft(false); }
  }, []);
  return <Link className={className} href="/painel/solicitacao/nova">{hasDraft ? "Continuar preenchimento" : emptyLabel}</Link>;
}
