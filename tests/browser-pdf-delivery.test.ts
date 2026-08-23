import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { A4_PAGE, drawCatalogingCard } from "../src/domain/cataloging-card/pdf.ts";
import type { CatalogingCardSnapshot } from "../src/domain/cataloging-card/types.ts";

const component = readFileSync("src/components/browser-pdf-delivery.tsx", "utf8");
const migration = readFileSync("supabase/migrations/202608230006_browser_pdf_delivery.sql", "utf8");
const snapshot: CatalogingCardSnapshot = { institution:{university:"Universidade Federal da Bahia — UFBA",librarySystem:"Sistema Universitário de Bibliotecas — SIBI",library:"Biblioteca da Faculdade de Arquitetura — BIB/FA"},request:{protocol:"FC2026-0001",title:"Arquitetura social",programName:"Arquitetura",academicLevel:"undergraduate"},people:[{role:"author",transcribedName:"Ana Silva",authorizedName:"Silva, Ana"},{role:"advisor",transcribedName:"Bia Souza",authorizedName:"Souza, Bia"}],subjects:[{labelPt:"Arquitetura",isPrimary:true}],classification:{cdu:"72",cutter:"S586"},technicalResponsibility:{name:"Bibliotecário",crb:"CRB-5/0000"},catalogingConventions:{electronicResourceLabel:"[recurso eletrônico]",physicalDescriptionAbbreviation:"p.",tracingsLabel:"Traçados"},layoutStatus:"provisional_pending_institutional_examples" };

test("draws the homologated card inside a protected A4 geometry", async () => {
  const document=await PDFDocument.create();const page=document.addPage(A4_PAGE);const regular=await document.embedFont(StandardFonts.Helvetica);const bold=await document.embedFont(StandardFonts.HelveticaBold);drawCatalogingCard(page,snapshot,{regular,bold});const result=await PDFDocument.load(await document.save());
  assert.equal(result.getPageCount(),1);assert.deepEqual(result.getPage(0).getSize(),{width:A4_PAGE[0],height:A4_PAGE[1]});
});

test("inserts a new card page immediately after the one-based title page", async () => {
  const document=await PDFDocument.create();document.addPage([400,600]);document.addPage([400,600]);const regular=await document.embedFont(StandardFonts.Helvetica);const bold=await document.embedFont(StandardFonts.HelveticaBold);const inserted=document.insertPage(1,A4_PAGE);drawCatalogingCard(inserted,snapshot,{regular,bold});const result=await PDFDocument.load(await document.save());
  assert.equal(result.getPageCount(),3);assert.deepEqual(result.getPage(1).getSize(),{width:A4_PAGE[0],height:A4_PAGE[1]});
});

test("inserts the card after the confirmed title page and stays browser-only", () => {
  assert.match(component,/insertPage\(titlePage,A4_PAGE\)/);
  assert.match(component,/mesmo arquivo analisado pela biblioteca/);
  assert.match(component,/workFile\.arrayBuffer\(\)/);
  assert.doesNotMatch(component,/fetch\(|storage\.from|FormData/);
});

test("supports a local custom font and gives cautious PDF-A guidance", () => {
  assert.match(component,/fontFile\.arrayBuffer\(\)/);
  assert.match(component,/\.ttf,\.otf/);
  assert.match(component,/não certifica conformidade PDF\/A/);
});

test("database releases only the immutable snapshot after Nada Consta approval", () => {
  assert.match(migration,/cataloging_card_homologations_released_student_read/);
  assert.match(migration,/n\.status='approved'/);
  assert.match(migration,/s\.profile_id=auth\.uid\(\)/);
});
