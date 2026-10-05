"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import { DeclarationCancellationControl } from "@/components/declaration-cancellation-control";
import { SharedFileIntegrityControl } from "@/components/shared-file-integrity-control";

const steps = [
  { id: "metadata", label: "Metadados", icon: "document", guidance: "Confira os dados enviados. Com pendências, devolva ao estudante; sem pendências, valide e siga para a catalogação." },
  { id: "cataloging", label: "Catalogação e ficha", icon: "book", guidance: "Complete autoridades, assuntos, CDU e Cutter; confira a prévia e homologue a ficha." },
  { id: "documentation", label: "Finalização e liberação", icon: "shield", guidance: "Confira a referência ABNT e o Nada Consta. A ficha só é liberada quando ela estiver homologada e o Nada Consta, aprovado." },
] as const;

export function RequestAnalysisSections({ metadata, cataloging, documentation, finalAction, declarationRequestId, declarationsReviewed = false, initialLinkVerified = false, publicWorkUrl = "", waitingForStudent = false, hasStudentMessage = false, sharedFileRequestId }: { metadata: ReactNode; cataloging: ReactNode; documentation: ReactNode; finalAction?: ReactNode; declarationRequestId?: string; declarationsReviewed?: boolean; initialLinkVerified?: boolean; publicWorkUrl?: string; waitingForStudent?: boolean; hasStudentMessage?: boolean; sharedFileRequestId?: string }) {
  const requestedStep = useSearchParams().get("etapa");
  const revisitRequested = useSearchParams().get("rever") === "1";
  const [showDeclarations, setShowDeclarations] = useState(Boolean(declarationRequestId) && (revisitRequested || !declarationsReviewed || !initialLinkVerified || waitingForStudent));
  const [replyPending, setReplyPending] = useState(false);
  const [active, setActive] = useState<"metadata" | "cataloging" | "documentation">(
    requestedStep === "cataloging" || requestedStep === "documentation" ? requestedStep : "metadata",
  );
  const activeStep = steps.findIndex((step) => step.id === active);
  const currentStep = steps[activeStep];
  const isMetadata = active === "metadata";
  useEffect(() => { if (declarationRequestId && (!initialLinkVerified || waitingForStudent)) setShowDeclarations(true); }, [declarationRequestId, initialLinkVerified, waitingForStudent]);
  useEffect(() => { if (revisitRequested && declarationRequestId) setShowDeclarations(true); }, [revisitRequested, declarationRequestId]);
  useEffect(() => { const onRevisit = () => { if (declarationRequestId) setShowDeclarations(true); }; window.addEventListener("request-analysis:revisit", onRevisit); return () => window.removeEventListener("request-analysis:revisit", onRevisit); }, [declarationRequestId]);
  useEffect(() => { const onReply = (event: Event) => setReplyPending(Boolean((event as CustomEvent<{ pending: boolean }>).detail?.pending)); window.addEventListener("request-analysis:reply-pending", onReply); return () => window.removeEventListener("request-analysis:reply-pending", onReply); }, []);
  useEffect(() => {
    if (requestedStep && steps.some((step) => step.id === requestedStep)) {
      setActive(requestedStep as typeof active);
    }
  }, [requestedStep]);
  useEffect(() => {
    const navigateToField = (event: Event) => {
      if (showDeclarations) return;
      const detail = (event as CustomEvent<{ tab?: typeof active; fieldId?: string }>).detail;
      if (!detail || !steps.some((step) => step.id === detail.tab)) return;
      setActive(detail.tab!);
      if (detail.fieldId) window.setTimeout(() => {
        const target = document.getElementById(detail.fieldId!);
        if (!target) return;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.remove("analysis-field-target");
        window.requestAnimationFrame(() => target.classList.add("analysis-field-target"));
        window.setTimeout(() => target.classList.remove("analysis-field-target"), 1_500);
      }, 120);
    };
    window.addEventListener("request-analysis:navigate", navigateToField);
    return () => window.removeEventListener("request-analysis:navigate", navigateToField);
  }, [showDeclarations]);
  return <div className="request-analysis-sections" data-active-section={active} data-declaration-preview={showDeclarations}>
    {declarationRequestId && showDeclarations && <DeclarationCancellationControl requestId={declarationRequestId} publicWorkUrl={publicWorkUrl} initiallyReviewed={declarationsReviewed} initiallyLinkVerified={initialLinkVerified} waitingForStudent={waitingForStudent} replyPending={replyPending} onContinue={() => setShowDeclarations(false)} onBack={declarationsReviewed && initialLinkVerified ? () => setShowDeclarations(false) : undefined} />}
    <section className="preanalysis-message" hidden={!showDeclarations || !hasStudentMessage}><div id="preanalysis-student-message" /></section>
    <div className="analysis-stepper" role="tablist" aria-label="Etapas da análise bibliotecária">
      {steps.map((step, index) => <button
        key={step.id}
        type="button"
        role="tab"
        aria-selected={active === step.id}
        className={active === step.id ? "is-active" : ""}
        onClick={() => setActive(step.id)}
      >
        <span className="analysis-stepper__number">{String(index + 1).padStart(2, "0")}</span>
        <span><AppIcon name={step.icon as AppIconName} />{step.label}</span>
      </button>)}
    </div>
    <aside className="analysis-next-action" aria-live="polite">
      <span>Etapa {activeStep + 1} de {steps.length}</span>
      <div><strong>{currentStep.label}</strong><p>{currentStep.guidance}</p></div>
    </aside>
    <section className="request-analysis-section" data-step="metadata">{metadata}<div id="request-analysis-actions-end" /></section>
    <section className="request-analysis-section" data-step="cataloging">{sharedFileRequestId && <SharedFileIntegrityControl requestId={sharedFileRequestId} />}{cataloging}</section>
    <section className="request-analysis-section" data-step="documentation">{sharedFileRequestId && <SharedFileIntegrityControl requestId={sharedFileRequestId} />}<div id="request-analysis-citation-end" />{documentation}<div id="request-analysis-summary-end" /><div id="request-cataloging-preview-end" />{finalAction}</section>
    <div className="form-navigation request-analysis-sections__navigation">
      {!isMetadata && <button className="button button--secondary button--small" type="button" onClick={() => setActive(steps[activeStep - 1].id)}>{`← Voltar: ${steps[activeStep - 1].label}`}</button>}
      {activeStep < steps.length - 1 && <button className="button button--secondary button--small" type="button" onClick={() => setActive(steps[activeStep + 1].id)}>Próxima: {steps[activeStep + 1].label} →</button>}
    </div>
  </div>;
}
