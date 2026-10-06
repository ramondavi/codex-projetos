"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AppIcon, type AppIconName } from "@/components/app-icon";

const steps = [
  { id: "metadata", label: "Metadados", icon: "document", guidance: "Confira os dados e marque apenas o que precisa de ajuste." },
  { id: "cataloging", label: "Catalogação e ficha", icon: "book", guidance: "Complete a catalogação, confira a ficha e homologue." },
  { id: "documentation", label: "Nada Consta e liberação", icon: "shield", guidance: "Confira o Nada Consta e veja o que falta para liberar." },
] as const;

export function RequestAnalysisSections({ metadata, cataloging, documentation, finalAction }: { metadata: ReactNode; cataloging: ReactNode; documentation: ReactNode; finalAction?: ReactNode }) {
  const requestedStep = useSearchParams().get("etapa");
  const [active, setActive] = useState<"metadata" | "cataloging" | "documentation">(
    requestedStep === "cataloging" || requestedStep === "documentation" ? requestedStep : "metadata",
  );
  const activeStep = steps.findIndex((step) => step.id === active);
  const currentStep = steps[activeStep];
  const isMetadata = active === "metadata";
  useEffect(() => {
    if (requestedStep && steps.some((step) => step.id === requestedStep)) {
      setActive(requestedStep as typeof active);
    }
  }, [requestedStep]);
  useEffect(() => {
    const navigateToField = (event: Event) => {
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
  }, []);
  return <div className="request-analysis-sections" data-active-section={active}>
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
      <div><strong><AppIcon name={currentStep.icon as AppIconName} /> Agora: {currentStep.guidance}</strong></div>
    </aside>
    <section className="request-analysis-section">{metadata}<div id="request-analysis-actions-end" /></section>
    <section className="request-analysis-section">{cataloging}</section>
    <section className="request-analysis-section">{documentation}<div id="request-analysis-summary-end" /><div id="request-cataloging-preview-end" />{finalAction}</section>
    <div className="form-navigation request-analysis-sections__navigation">
      <button className="button button--secondary button--small" type="button" disabled={isMetadata} onClick={() => setActive(steps[activeStep - 1].id)}>{isMetadata ? "← Voltar" : `← Voltar: ${steps[activeStep - 1].label}`}</button>
      {activeStep < steps.length - 1 && <button className="button button--secondary button--small" type="button" onClick={() => setActive(steps[activeStep + 1].id)}>Próxima: {steps[activeStep + 1].label} →</button>}
    </div>
  </div>;
}
