"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { buildCardContent, type CatalogingCardSnapshot } from "@/domain/cataloging-card/types";
import { A4_PAGE, drawCatalogingCard } from "@/domain/cataloging-card/pdf";
import { createClient } from "@/lib/supabase/client";

export function CatalogingCardReview({ requestId, snapshot, homologatedAt, canHomologate }: {
  requestId: string; snapshot: CatalogingCardSnapshot; homologatedAt: string | null; canHomologate: boolean;
}) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const content = buildCardContent(snapshot);

  async function homologate() {
    setBusy(true); setError("");
    const supabase = createClient();
    const { error: homologationError } = await supabase.rpc("homologate_cataloging_card", { target_request_id: requestId });
    if (homologationError) { setError("Não foi possível homologar. Confirme se todos os dados obrigatórios continuam preenchidos."); setBusy(false); return; }
    router.refresh();
  }

  async function downloadPdf() {
    const document = await PDFDocument.create();
    const page = document.addPage(A4_PAGE);
    const regular = await document.embedFont(StandardFonts.Helvetica);
    const bold = await document.embedFont(StandardFonts.HelveticaBold);
    page.drawText("LAYOUT PROVISÓRIO — VALIDAR COM EXEMPLOS INSTITUCIONAIS", { x: 136, y: 795, size: 8, font: bold, color: rgb(.42, .42, .42) });
    drawCatalogingCard(page, snapshot, { regular, bold });
    const bytes = await document.save();
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a"); anchor.href = url; anchor.download = `ficha-${snapshot.request.protocol}.pdf`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <>
    <section className="panel final-review"><div><p className="eyebrow">Revisão final</p><h1>Ficha catalográfica</h1><p>Confira o conteúdo homologável. O layout permanece provisório até testes com exemplos institucionais reais.</p></div><span className={`request-status ${homologatedAt ? "request-status--done" : ""}`}>{homologatedAt ? `Homologada em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(homologatedAt))}` : "Aguardando homologação"}</span></section>
    <section className="cataloging-card" aria-label="Prévia da ficha catalográfica">
      <header><strong>Dados Internacionais de Catalogação na Publicação (CIP)</strong><span>{snapshot.institution.university}</span><span>{snapshot.institution.librarySystem} · {snapshot.institution.library}</span></header>
      <div className="cataloging-card__content"><strong>{content.authorizedAuthor}</strong><p>{content.titleStatement}</p>{content.notes.map((note) => <p key={note}>{note}</p>)}<p>{content.tracings}</p></div>
      <div className="cataloging-card__classification"><span>Cutter {snapshot.classification.cutter}</span><span>CDU {snapshot.classification.cdu}</span></div>
      <footer>{snapshot.technicalResponsibility.name} · {snapshot.technicalResponsibility.crb}</footer>
    </section>
    <section className="panel homologation-panel"><div><strong>Layout provisório</strong><p>A homologação registra o conteúdo e a responsabilidade técnica. Ela não declara que as medidas finais já foram validadas institucionalmente.</p></div>{!homologatedAt && canHomologate && <label className="check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Revisei as formas de nome, termos, CDU, Cutter e conteúdo da ficha.</label>}{error && <p className="form-error" role="alert">{error}</p>}<div className="homologation-actions">{!homologatedAt && <button className="button button--primary" type="button" disabled={!canHomologate || !confirmed || busy} onClick={homologate}>{busy ? "Homologando…" : "Homologar ficha"}</button>}<button className="button button--secondary" type="button" disabled={!homologatedAt} onClick={downloadPdf}>Baixar ficha isolada em PDF</button></div></section>
  </>;
}
