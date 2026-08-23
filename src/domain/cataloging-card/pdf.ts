import { type PDFFont, type PDFPage } from "pdf-lib";
import { buildCardContent, type CatalogingCardSnapshot } from "./types.ts";

export const A4_PAGE: [number, number] = [595.28, 841.89];

export function drawCatalogingCard(page: PDFPage, snapshot: CatalogingCardSnapshot, fonts: { regular: PDFFont; bold: PDFFont }) {
  const { regular, bold } = fonts; const content = buildCardContent(snapshot);
  const left = 62; const right = 533; const cardTop = 485; const minimumCardBottom = 142; const width = right - left;
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
}

function center(page: PDFPage, text: string, y: number, size: number, font: PDFFont) { page.drawText(text, { x: (A4_PAGE[0] - font.widthOfTextAtSize(text, size)) / 2, y, size, font }); }
function drawWrapped(page: PDFPage, text: string, x: number, y: number, width: number, size: number, font: PDFFont, lineHeight: number) {
  const words=text.split(/\s+/);const lines:string[]=[];let line="";
  for(const word of words){const candidate=line?`${line} ${word}`:word;if(font.widthOfTextAtSize(candidate,size)<=width)line=candidate;else{if(line)lines.push(line);line=word;}}
  if(line)lines.push(line);lines.forEach((value,index)=>page.drawText(value,{x,y:y-index*lineHeight,size,font}));return y-lines.length*lineHeight;
}
