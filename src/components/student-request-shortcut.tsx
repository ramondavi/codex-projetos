"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { restoreStudentRequestDraft, studentRequestDraftKey } from "@/domain/student-requests/draft";
import { AppIcon } from "@/components/app-icon";
import { isStudentDraftComplete, type Program } from "@/components/student-request-form";

export function StudentRequestShortcut({ className, emptyLabel = "Iniciar solicitação", programs, userId }: { className?: string; emptyLabel?: string; programs: Program[]; userId: string }) {
  const draftKey = studentRequestDraftKey(userId);
  const [hasDraft, setHasDraft] = useState(false);
  const [complete, setComplete] = useState(false);
  const [savedAt, setSavedAt] = useState<string>();
  useEffect(() => {
    const loadDraft = () => {
    try {
      const stored = localStorage.getItem(draftKey);
      setHasDraft(Boolean(stored));
      if (!stored) { setComplete(false); setSavedAt(undefined); return; }
      const parsed = JSON.parse(stored);
      setComplete(isStudentDraftComplete(restoreStudentRequestDraft(parsed?.draft ?? parsed), programs));
      setSavedAt(typeof parsed?.savedAt === "string" && Number.isFinite(Date.parse(parsed.savedAt)) ? parsed.savedAt : undefined);
    } catch { setHasDraft(false); setComplete(false); setSavedAt(undefined); }
    };
    const onStorage = (event: StorageEvent) => { if (event.key === draftKey) loadDraft(); };
    loadDraft();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", loadDraft);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("focus", loadDraft); };
  }, [draftKey, programs]);
  return <div className="student-request-shortcut"><Link className={className} href={complete ? "/painel/solicitacao/nova?revisao=1" : "/painel/solicitacao/nova"}>{complete ? "Revisar e enviar" : hasDraft ? "Continuar preenchimento" : emptyLabel}</Link>{hasDraft && savedAt && <span className="student-request-shortcut__saved"><AppIcon name="check" /><span>Rascunho salvo neste dispositivo<time dateTime={savedAt}>{new Date(savedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</time></span></span>}</div>;
}
