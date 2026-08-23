import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildCardContent, type CatalogingCardSnapshot } from "../src/domain/cataloging-card/types.ts";

const migration = readFileSync("supabase/migrations/202608230004_cataloging_card.sql", "utf8");
const snapshot: CatalogingCardSnapshot = {
  institution: { university: "Universidade Federal da Bahia — UFBA", librarySystem: "Sistema Universitário de Bibliotecas — SIBI", library: "Biblioteca da Faculdade de Arquitetura — BIB/FA" },
  request: { protocol: "FC2026-0001", title: "Arquitetura social", subtitle: "um estudo", equivalentTitle: "Social architecture", programName: "Arquitetura", academicLevel: "undergraduate" },
  people: [
    { role: "author", transcribedName: "Ana Silva", authorizedName: "Silva, Ana" },
    { role: "advisor", transcribedName: "Bruno Souza", authorizedName: "Souza, Bruno" },
  ],
  subjects: [{ labelPt: "Arquitetura", labelEn: "Architecture", isPrimary: true }],
  classification: { cdu: "72", cutter: "S586" },
  technicalResponsibility: { name: "Catalogador", crb: "CRB-5/0000" },
  catalogingConventions: { electronicResourceLabel: "[recurso eletrônico]", physicalDescriptionAbbreviation: "p.", tracingsLabel: "Traçados" },
  layoutStatus: "provisional_pending_institutional_examples",
};

test("places authorized and transcribed names in their confirmed positions", () => {
  const content = buildCardContent(snapshot);
  assert.equal(content.authorizedAuthor, "Silva, Ana");
  assert.match(content.titleStatement, /\/ Ana Silva\./);
  assert.deepEqual(content.notes, ["Orientador: Bruno Souza."]);
  assert.match(content.tracings, /I\. Souza, Bruno\./);
});

test("uses only the confirmed cataloging labels", () => {
  const content = buildCardContent(snapshot);
  assert.match(content.titleStatement, /\[recurso eletrônico\]/);
  assert.match(content.tracings, /^Traçados:/);
  assert.match(content.titleStatement, / = Social architecture/);
});

test("creates an immutable homologation snapshot owned by the ticket librarian", () => {
  assert.match(migration, /cataloging_card_homologation_immutable/);
  assert.match(migration, /assigned_to = auth\.uid\(\)[\s\S]*status = 'in_review'/);
  assert.match(migration, /cataloging_card_homologated/);
  assert.match(migration, /layout_version.*provisional-v1/);
});

test("requires classification, authorities and a primary controlled term", () => {
  assert.match(migration, /classification_required/);
  assert.match(migration, /author_and_advisor_authorities_required/);
  assert.match(migration, /primary_controlled_term_required/);
});

test("does not queue final release during homologation before Nada Consta", () => {
  const functionBody = migration.match(/create or replace function public\.homologate_cataloging_card[\s\S]*?revoke all on function/)?.[0] ?? "";
  assert.doesNotMatch(functionBody, /queue_request_release_notice|request_released/);
});
