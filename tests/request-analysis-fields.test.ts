import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("só mostra a mensagem opcional quando o estudante a preencheu", async () => {
  const page = await readFile("src/app/painel/atendimento/[id]/page.tsx", "utf8");
  assert.match(page, /request\.library_note\?\.trim\(\) \? \[\{ key: "library_note"/);
  assert.match(page, /: \[\]\),/);
});
