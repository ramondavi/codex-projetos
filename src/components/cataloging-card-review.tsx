"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDocument, StandardFonts } from "pdf-lib";
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
    drawCatalogingCard(page, snapshot, { regular, bold });
    const bytes = await document.save();
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a"); anchor.href = url; anchor.download = `ficha-${snapshot.request.protocol}.pdf`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <>
    <section className="panel final-review"><div><p className="eyebrow">Revisão final</p><h1>Ficha catalográfica</h1><p>Confira o conteúdo e a disposição conforme os modelos institucionais validados.</p></div><span className={`request-status ${homologatedAt ? "request-status--done" : ""}`}>{homologatedAt ? `Homologada em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(homologatedAt))}` : "Aguardando homologação"}</span></section>
    <section className="cataloging-card" aria-label="Prévia da ficha catalográfica">
      <header><strong>Dados Internacionais de Catalogação na Publicação (CIP)</strong><strong>{snapshot.institution.university}</strong><strong>{snapshot.institution.librarySystem}</strong><strong>{snapshot.institution.library}</strong></header>
      <div className="cataloging-card__body"><span className="cataloging-card__cutter">{snapshot.classification.cutter}</span><div className="cataloging-card__content"><p className="cataloging-card__authorized">{content.authorizedAuthor}</p><p>{content.titleStatement}</p>{content.physicalDescription && <p>{content.physicalDescription}</p>}{content.academicNote && <p className="cataloging-card__spaced">{content.academicNote}</p>}{content.notes.map((note) => <p key={note}>{note}</p>)}<p className="cataloging-card__spaced">{content.tracings}</p><p className="cataloging-card__cdu">CDU: {snapshot.classification.cdu}</p></div></div>
      <footer>{content.technicalResponsibility}</footer>
    </section>
    <section className="panel homologation-panel"><div><strong>Modelo institucional</strong><p>A prévia e o PDF usam o mesmo conteúdo homologável e as regras validadas para TCC, dissertação e tese.</p></div>{!homologatedAt && canHomologate && <label className="check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Revisei formas de nome, anos, descrição física, termos, CDU, Cutter e conteúdo da ficha.</label>}{error && <p className="form-error" role="alert">{error}</p>}<div className="homologation-actions">{!homologatedAt && <button className="button button--primary" type="button" disabled={!canHomologate || !confirmed || busy} onClick={homologate}>{busy ? "Homologando…" : "Homologar ficha"}</button>}<button className="button button--secondary" type="button" disabled={!homologatedAt} onClick={downloadPdf}>Baixar ficha isolada em PDF</button></div></section>
  </>;
}
