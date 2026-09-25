"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STUDENT_REQUEST_DRAFT_KEY } from "@/domain/student-requests/draft";
import { AppIcon } from "@/components/app-icon";

export function StudentRequestShortcut({ className, emptyLabel = "Iniciar solicitação" }: { className?: string; emptyLabel?: string }) {
  const [hasDraft, setHasDraft] = useState(false);
  const [savedAt, setSavedAt] = useState<string>();
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STUDENT_REQUEST_DRAFT_KEY);
      setHasDraft(Boolean(stored));
      if (!stored) return;
      const date = JSON.parse(stored).savedAt;
      if (typeof date === "string" && Number.isFinite(Date.parse(date))) setSavedAt(date);
    } catch { setSavedAt(undefined); }
  }, []);
  return <div className="student-request-shortcut"><Link className={className} href="/painel/solicitacao/nova">{hasDraft ? "Continuar preenchimento" : emptyLabel}</Link>{hasDraft && savedAt && <span className="student-request-shortcut__saved"><AppIcon name="check" /><span>Rascunho salvo neste dispositivo<time dateTime={savedAt}>{new Date(savedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</time></span></span>}</div>;
}
