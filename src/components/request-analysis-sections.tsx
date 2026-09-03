"use client";

import { useState, type ReactNode } from "react";

export function RequestAnalysisSections({ metadata, documentation }: { metadata: ReactNode; documentation: ReactNode }) {
  const [active, setActive] = useState<"metadata" | "documentation">("metadata");
  const isMetadata = active === "metadata";
  return <div className="request-analysis-sections" data-active-section={active}>
    <div className="admin-tabs" role="tablist" aria-label="Seções do atendimento">
      <button type="button" role="tab" aria-selected={active === "metadata"} className={active === "metadata" ? "is-active" : ""} onClick={() => setActive("metadata")}>Análise dos metadados</button>
      <button type="button" role="tab" aria-selected={active === "documentation"} className={active === "documentation" ? "is-active" : ""} onClick={() => setActive("documentation")}>Documentação e histórico</button>
    </div>
    <section className="panel admin-section request-analysis-section">{metadata}</section>
    <section className="panel admin-section request-analysis-section">{documentation}</section>
    <div className="form-navigation request-analysis-sections__navigation">
      <button className="button button--secondary" type="button" disabled={isMetadata} onClick={() => setActive("metadata")}>Voltar</button>
      <button className="button button--primary" type="button" disabled={!isMetadata} onClick={() => setActive("documentation")}>Avançar</button>
    </div>
    <div id="request-analysis-actions-end" />
  </div>;
}
