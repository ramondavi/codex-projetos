import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("a etapa final leva o responsável à homologação da ficha", async () => {
  const page = await readFile("src/app/painel/atendimento/[id]/page.tsx", "utf8");
  const sections = await readFile("src/components/request-analysis-sections.tsx", "utf8");
  assert.match(page, /Revisar e homologar ficha/);
  assert.match(page, /\/painel\/atendimento\/\$\{id\}\/ficha/);
  assert.match(sections, /finalAction\?: ReactNode/);
});
