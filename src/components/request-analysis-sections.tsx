"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import { DeclarationCancellationControl } from "@/components/declaration-cancellation-control";
import { SharedFileIntegrityControl } from "@/components/shared-file-integrity-control";

const steps = [
  { id: "metadata", label: "Metadados", icon: "document" },
  { id: "cataloging", label: "Catalogação e ficha", icon: "book" },
  { id: "documentation", label: "Finalização e liberação", icon: "shield" },
] as const;

export function RequestAnalysisSections({ metadata, cataloging, documentation, finalAction, declarationRequestId, declarationsReviewed = false, initialLinkVerified = false, metadataComplete = false, catalogingComplete = false, citationComplete = false, nadaConstaComplete = false, documentationComplete = false, publicWorkUrl = "", waitingForStudent = false, hasStudentMessage = false, sharedFileRequestId }: { metadata: ReactNode; cataloging: ReactNode; documentation: ReactNode; finalAction?: ReactNode; declarationRequestId?: string; declarationsReviewed?: boolean; initialLinkVerified?: boolean; metadataComplete?: boolean; catalogingComplete?: boolean; citationComplete?: boolean; nadaConstaComplete?: boolean; documentationComplete?: boolean; publicWorkUrl?: string; waitingForStudent?: boolean; hasStudentMessage?: boolean; sharedFileRequestId?: string }) {
  const requestedStep = useSearchParams().get("etapa");
  const revisitRequested = useSearchParams().get("rever") === "1";
  const [showDeclarations, setShowDeclarations] = useState(Boolean(declarationRequestId) && (revisitRequested || !declarationsReviewed || !initialLinkVerified || waitingForStudent));
  const [replyPending, setReplyPending] = useState(false);
  const [citationReady, setCitationReady] = useState(citationComplete);
  const [active, setActive] = useState<"metadata" | "cataloging" | "documentation">(
    requestedStep === "cataloging" || requestedStep === "documentation" || requestedStep === "metadata" ? requestedStep : !metadataComplete ? "metadata" : !catalogingComplete ? "cataloging" : "documentation",
  );
  const activeStep = steps.findIndex((step) => step.id === active);
  const isMetadata = active === "metadata";
  const preliminaryComplete = declarationsReviewed && initialLinkVerified && !waitingForStudent;
  const completed = [metadataComplete, catalogingComplete, documentationComplete];
  const finalChecksReady = Number(citationReady) + Number(catalogingComplete) + Number(nadaConstaComplete);
  useEffect(() => setCitationReady(citationComplete), [citationComplete]);
  useEffect(() => { const onCitationStatus = (event: Event) => setCitationReady(Boolean((event as CustomEvent<{ ready: boolean }>).detail?.ready)); window.addEventListener("request-analysis:citation-status", onCitationStatus); return () => window.removeEventListener("request-analysis:citation-status", onCitationStatus); }, []);
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
    <aside className={`analysis-precheck${showDeclarations ? " is-active" : ""}`} aria-label="Etapa preliminar">
      <span className="analysis-precheck__icon"><AppIcon name={preliminaryComplete ? "check" : "review"} /></span>
      <div><span className="analysis-precheck__eyebrow">Antes da análise</span><strong>Conferência inicial</strong><small>{waitingForStudent ? "Aguardando correção do link pelo estudante." : showDeclarations ? preliminaryComplete ? "Revisão das declarações aberta." : "Conclua esta conferência para iniciar a análise." : declarationRequestId && preliminaryComplete ? "Para rever, use Outras ações → Rever declarações." : preliminaryComplete ? "Concluída." : "Conferência pendente."}</small></div>
      <span className="analysis-precheck__status">{waitingForStudent ? "Aguardando estudante" : showDeclarations ? preliminaryComplete ? "Em revisão" : "Em conferência" : preliminaryComplete ? "Concluída" : "Pendente"}</span>
    </aside>
    <nav className="analysis-stepper analysis-stepper--guided" aria-label="Etapas da análise do atendimento">
      <span className="analysis-stepper__heading">Análise do atendimento</span>
      {steps.map((step, index) => <button
        key={step.id}
        type="button"
        aria-current={!showDeclarations && active === step.id ? "step" : undefined}
        className={`${!showDeclarations && active === step.id ? "is-active" : ""} ${completed[index] ? "is-complete" : ""}`}
        disabled={showDeclarations}
        onClick={() => setActive(step.id)}
      >
        <span className="analysis-stepper__number">{completed[index] ? <AppIcon name="check" /> : String(index + 1).padStart(2, "0")}</span>
        <span><AppIcon name={step.icon as AppIconName} /><strong>{step.label}</strong><small>{completed[index] ? "Concluída" : !showDeclarations && active === step.id ? "Em andamento" : "A seguir"}</small></span>
      </button>)}
    </nav>
    {!showDeclarations && <div className="request-analysis-sections__toolbar" aria-label="Navegação da análise"><span>Etapa {activeStep + 1} de {steps.length}</span><div>{!isMetadata && <button type="button" onClick={() => setActive(steps[activeStep - 1].id)}><AppIcon name="arrowRight" />Anterior: {steps[activeStep - 1].label}</button>}{activeStep < steps.length - 1 && <button type="button" onClick={() => setActive(steps[activeStep + 1].id)}>Continuar: {steps[activeStep + 1].label}<AppIcon name="arrowRight" /></button>}</div></div>}
    {declarationRequestId && showDeclarations && <DeclarationCancellationControl requestId={declarationRequestId} publicWorkUrl={publicWorkUrl} initiallyReviewed={declarationsReviewed} initiallyLinkVerified={initialLinkVerified} waitingForStudent={waitingForStudent} replyPending={replyPending} onContinue={() => setShowDeclarations(false)} onBack={declarationsReviewed && initialLinkVerified ? () => setShowDeclarations(false) : undefined} />}
    <section className="preanalysis-message" hidden={!showDeclarations || !hasStudentMessage}><div id="preanalysis-student-message" /></section>
    <section className="request-analysis-section" data-step="metadata">{metadata}</section>
    <section className="request-analysis-section" data-step="cataloging">{sharedFileRequestId && <SharedFileIntegrityControl requestId={sharedFileRequestId} />}{cataloging}</section>
    <section className="request-analysis-section" data-step="documentation">{sharedFileRequestId && <SharedFileIntegrityControl requestId={sharedFileRequestId} />}<div className="analysis-stage-progress analysis-stage-progress--final" aria-label="Progresso da finalização"><strong>{finalChecksReady} de 3 verificações concluídas</strong><span>{3 - finalChecksReady} {3 - finalChecksReady === 1 ? "pendência" : "pendências"}</span><small>Referência · Ficha homologada · Nada Consta</small></div><div id="request-analysis-citation-end" />{documentation}<div id="request-analysis-summary-end" /><div id="request-cataloging-preview-end" />{finalAction}</section>
  </div>;
}
