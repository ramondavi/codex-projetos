import { type PDFFont, type PDFPage } from "pdf-lib";
import { buildCardContent, prefixBeforeFourthAuthorLetter, type CatalogingCardSnapshot } from "./types.ts";

export const A4_PAGE: [number, number] = [595.28, 841.89];
const CARD_LEFT = 126.25;
const CARD_RIGHT = 497.75;
const BODY_LEFT = 163.1;
const FONT_SIZE = 10;
const LINE_HEIGHT = 12.6;

export function drawCatalogingCard(page: PDFPage, snapshot: CatalogingCardSnapshot, fonts: { regular: PDFFont; bold: PDFFont }) {
  const { regular, bold } = fonts;
  const content = buildCardContent(snapshot);
  const headerTop = 397;
  center(page, "Dados Internacionais de Catalogação na Publicação (CIP)", headerTop, FONT_SIZE, bold);
  center(page, snapshot.institution.university, headerTop - 12.6, FONT_SIZE, bold);
  center(page, snapshot.institution.librarySystem, headerTop - 25.2, FONT_SIZE, bold);
  center(page, snapshot.institution.library, headerTop - 37.8, FONT_SIZE, bold);
  page.drawLine({ start: { x: CARD_LEFT, y: headerTop - 52.1 }, end: { x: CARD_RIGHT, y: headerTop - 52.1 }, thickness: 1.4 });
  page.drawText(snapshot.classification.cutter, { x: 127.7, y: headerTop - 75, size: FONT_SIZE, font: regular });
  let y = headerTop - 87.6;
  const hangingOffset = regular.widthOfTextAtSize(prefixBeforeFourthAuthorLetter(content.authorizedAuthor), FONT_SIZE);
  y = drawWrapped(page, content.authorizedAuthor, BODY_LEFT, y, CARD_RIGHT - BODY_LEFT, FONT_SIZE, regular, LINE_HEIGHT);
  y = drawHanging(page, content.titleStatement, y, regular, hangingOffset);
  if (content.physicalDescription) y = drawHanging(page, content.physicalDescription, y, regular, hangingOffset);
  if (content.academicNote) y = drawHanging(page, content.academicNote, y - LINE_HEIGHT, regular, hangingOffset);
  for (const note of content.notes) y = drawHanging(page, note, y, regular, hangingOffset);
  y = drawHanging(page, content.tracings, y - LINE_HEIGHT, regular, hangingOffset);
  const bottomLine = 72;
  const cduText = `CDU: ${snapshot.classification.cdu}`;
  page.drawText(cduText, { x: CARD_RIGHT - regular.widthOfTextAtSize(cduText, FONT_SIZE), y: bottomLine + 24, size: FONT_SIZE, font: regular });
  page.drawLine({ start: { x: CARD_LEFT, y: bottomLine }, end: { x: CARD_RIGHT, y: bottomLine }, thickness: 1.4 });
  center(page, content.technicalResponsibility, bottomLine - 28, FONT_SIZE, regular);
}

function center(page: PDFPage, text: string, y: number, size: number, font: PDFFont) {
  page.drawText(text, { x: (A4_PAGE[0] - font.widthOfTextAtSize(text, size)) / 2, y, size, font });
}

function wrap(text: string, firstWidth: number, continuationWidth: number, size: number, font: PDFFont) {
  const words = text.trim().split(/\s+/); const lines: string[] = []; let line = ""; let width = firstWidth;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) line = candidate;
    else { if (line) lines.push(line); line = word; width = continuationWidth; }
  }
  if (line) lines.push(line);
  return lines;
}

function drawHanging(page: PDFPage, text: string, y: number, font: PDFFont, offset: number) {
  const firstLineLeft = BODY_LEFT + offset;
  const lines = wrap(text, CARD_RIGHT - firstLineLeft, CARD_RIGHT - BODY_LEFT, FONT_SIZE, font);
  lines.forEach((line, index) => page.drawText(line, { x: index === 0 ? firstLineLeft : BODY_LEFT, y: y - index * LINE_HEIGHT, size: FONT_SIZE, font }));
  return y - lines.length * LINE_HEIGHT;
}

function drawWrapped(page: PDFPage, text: string, x: number, y: number, width: number, size: number, font: PDFFont, lineHeight: number) {
  const lines = wrap(text, width, width, size, font);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * lineHeight, size, font }));
  return y - lines.length * lineHeight;
}
