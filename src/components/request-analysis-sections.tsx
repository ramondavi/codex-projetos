"use client";

import { useEffect, useState, type ReactNode } from "react";

const steps = [
  { id: "metadata", label: "Metadados", guidance: "Confira os dados enviados e registre somente as correções necessárias." },
  { id: "cataloging", label: "Catalogação", guidance: "Complete autoridades, assuntos, CDU e Cutter para preparar o registro." },
  { id: "documentation", label: "Documentação e encerramento", guidance: "Valide a documentação, consulte o histórico e conclua a revisão quando estiver tudo certo." },
  { id: "review", label: "Revisão do atendimento", guidance: "Confira o conjunto do atendimento e escolha se ele segue no fluxo ou volta ao estudante para ajuste." },
] as const;

export function RequestAnalysisSections({ metadata, cataloging, documentation }: { metadata: ReactNode; cataloging: ReactNode; documentation: ReactNode }) {
  const [active, setActive] = useState<"metadata" | "cataloging" | "documentation" | "review">("metadata");
  const activeStep = steps.findIndex((step) => step.id === active);
  const currentStep = steps[activeStep];
  const isMetadata = active === "metadata";
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
        <span>{step.label}</span>
      </button>)}
    </div>
    <aside className="analysis-next-action" aria-live="polite">
      <span>Etapa {activeStep + 1} de {steps.length}</span>
      <div><strong>{currentStep.label}</strong><p>{currentStep.guidance}</p></div>
    </aside>
    <section className="request-analysis-section">{metadata}</section>
    <section className="request-analysis-section">{cataloging}</section>
    <section className="request-analysis-section">{documentation}</section>
    <section className="request-analysis-section request-analysis-section--review"><div id="request-cataloging-preview-end" /><div id="request-analysis-actions-end" /></section>
    <div className="form-navigation request-analysis-sections__navigation">
      <button className="button button--secondary button--small" type="button" disabled={isMetadata} onClick={() => setActive(steps[activeStep - 1].id)}>← Voltar</button>
      {activeStep < steps.length - 1 && <button className="button button--secondary button--small" type="button" onClick={() => setActive(steps[activeStep + 1].id)}>Próxima: {steps[activeStep + 1].label} →</button>}
    </div>
  </div>;
}
