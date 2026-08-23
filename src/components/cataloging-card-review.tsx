"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { buildCardContent, type CatalogingCardSnapshot } from "@/domain/cataloging-card/types";
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
    const page = document.addPage([595.28, 841.89]);
    const regular = await document.embedFont(StandardFonts.Helvetica);
    const bold = await document.embedFont(StandardFonts.HelveticaBold);
    const left = 62; const right = 533; const cardTop = 485; const minimumCardBottom = 142; const width = right - left;
    page.drawText("LAYOUT PROVISÓRIO — VALIDAR COM EXEMPLOS INSTITUCIONAIS", { x: 136, y: 795, size: 8, font: bold, color: rgb(.42, .42, .42) });
    center(page, "Dados Internacionais de Catalogação na Publicação (CIP)", cardTop + 28, 11, bold);
    center(page, snapshot.institution.university, cardTop + 13, 8.5, regular);
    center(page, `${snapshot.institution.librarySystem} · ${snapshot.institution.library}`, cardTop + 1, 8.5, regular);
    page.drawLine({ start: { x: left, y: cardTop - 10 }, end: { x: right, y: cardTop - 10 }, thickness: 1 });
    let y = cardTop - 34;
    y = drawWrapped(page, content.authorizedAuthor, left + 12, y, width - 24, 9.5, bold, 12);
    y = drawWrapped(page, content.titleStatement, left + 36, y - 3, width - 48, 9.5, regular, 12);
    for (const note of content.notes) y = drawWrapped(page, note, left + 36, y - 3, width - 48, 9.5, regular, 12);
    y = drawWrapped(page, content.tracings, left + 36, y - 5, width - 48, 9.5, regular, 12);
    const cardBottom = Math.max(70, Math.min(minimumCardBottom, y - 48));
    page.drawText(`Cutter ${snapshot.classification.cutter}`, { x: left + 12, y: cardBottom + 30, size: 9, font: regular });
    const cduText = `CDU ${snapshot.classification.cdu}`;
    page.drawText(cduText, { x: right - 12 - regular.widthOfTextAtSize(cduText, 9), y: cardBottom + 30, size: 9, font: regular });
    page.drawLine({ start: { x: left, y: cardBottom + 17 }, end: { x: right, y: cardBottom + 17 }, thickness: 1 });
    center(page, `${snapshot.technicalResponsibility.name} · ${snapshot.technicalResponsibility.crb}`, cardBottom, 8.5, regular);
    const bytes = await document.save();
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a"); anchor.href = url; anchor.download = `ficha-${snapshot.request.protocol}.pdf`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    function center(pdfPage: typeof page, text: string, positionY: number, size: number, font: typeof regular) {
      pdfPage.drawText(text, { x: (595.28 - font.widthOfTextAtSize(text, size)) / 2, y: positionY, size, font });
    }
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

function drawWrapped(page: ReturnType<PDFDocument["addPage"]>, text: string, x: number, y: number, width: number, size: number, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, lineHeight: number) {
  const words = text.split(/\s+/); const lines: string[] = []; let line = "";
  for (const word of words) { const candidate = line ? `${line} ${word}` : word; if (font.widthOfTextAtSize(candidate, size) <= width) line = candidate; else { if (line) lines.push(line); line = word; } }
  if (line) lines.push(line);
  lines.forEach((value, index) => page.drawText(value, { x, y: y - index * lineHeight, size, font }));
  return y - lines.length * lineHeight;
}
