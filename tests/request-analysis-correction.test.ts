import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

test("uma correção só é salva quando altera o valor do campo", async () => {
  const component = await readFile("src/components/request-analysis-workspace.tsx", "utf8");
  assert.match(component, /JSON\.stringify\(correctedValue\) === JSON\.stringify\(originalValue\)/);
  assert.match(component, /setState\("idle"\)/);
});

test("a análise mostra data do salvamento e oferece conclusão e restauração segura", async () => {
  const component = await readFile("src/components/request-analysis-workspace.tsx", "utf8");
  assert.match(component, /Alterações salvas há/);
  assert.match(component, /date\.getDate\(\)/);
  assert.match(component, /Concluir revisão e prosseguir/);
  assert.match(component, /reset_direct_request_corrections/);
  assert.match(component, /savedText\.current/);
});
