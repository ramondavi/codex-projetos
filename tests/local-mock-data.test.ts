import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const script = readFileSync("scripts/mock-local-data.mjs", "utf8");
const template = readFileSync("supabase/mock-data.sql.template", "utf8");
const gitignore = readFileSync(".gitignore", "utf8");

test("mock local permanece restrito ao contêiner do Supabase local", () => {
  assert.match(script, /supabase_db_codex-projetos/);
  assert.doesNotMatch(script, /service_role|supabase\.co|DATABASE_URL|SUPABASE_SECRET/);
});

test("credenciais geradas permanecem fora do Git", () => {
  assert.match(gitignore, /^\.auth\/$/m);
  assert.match(script, /randomBytes/);
  assert.match(script, /mock-users\.txt/);
  assert.doesNotMatch(template, /Senha:/);
});

test("cenários cobrem as etapas operacionais do MVP", () => {
  for (const status of ["submitted", "in_review", "changes_requested", "approved", "completed"]) {
    assert.match(template, new RegExp(`'${status}'`));
  }
  assert.match(template, /coordination_magic_links/);
  assert.match(template, /cataloging_card_homologations/);
  assert.match(template, /nada_consta_documents/);
  assert.match(template, /repository_publications/);
});

test("contas SQL preenchem os tokens internos exigidos pelo Supabase Auth", () => {
  assert.match(template, /confirmation_token\s*=\s*coalesce\(confirmation_token, ''\)/);
  assert.match(template, /recovery_token\s*=\s*coalesce\(recovery_token, ''\)/);
  assert.match(template, /email_change_token_new\s*=\s*coalesce\(email_change_token_new, ''\)/);
  assert.match(template, /email_change\s*=\s*coalesce\(email_change, ''\)/);
  assert.match(template, /phone_change\s*=\s*coalesce\(phone_change, ''\)/);
  assert.match(template, /reauthentication_token\s*=\s*coalesce\(reauthentication_token, ''\)/);
  assert.match(script, /token\?grant_type=password/);
  assert.match(script, /Supabase Auth local recusou a conta sintética/);
});
