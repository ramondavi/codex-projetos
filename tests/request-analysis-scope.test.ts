import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("reserva matrícula e pessoas para seus fluxos próprios", async () => {
  const page = await readFile("src/app/painel/atendimento/[id]/page.tsx", "utf8");
  const workspace = await readFile("src/components/request-analysis-workspace.tsx", "utf8");
  assert.doesNotMatch(page.match(/const reviewFields:[\s\S]*?\n  \];/)?.[0] ?? "", /registration_number|Autor informado|Orientador informado|Palavras-chave/);
  assert.match(workspace, /Informação anterior — corrigida e sem validade/);
  assert.match(workspace, /initialCorrectionBaselines/);
});

test("expõe valores anteriores apenas para a equipe autorizada", async () => {
  const migration = await readFile("supabase/migrations/202609140003_direct_correction_history_read.sql", "utf8");
  assert.match(migration, /current_user_role\(\) in \('cataloger', 'administrator'\)/);
  assert.match(migration, /request_direct_correction_baselines/);
});
