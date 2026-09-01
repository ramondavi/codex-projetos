import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("política de privacidade", () => {
  it("identifica a versão publicada", async () => {
    const page = await readFile("src/app/politica-de-privacidade/page.tsx", "utf8");
    assert.match(page, /Política de privacidade · versão 1\.0/);
    assert.doesNotMatch(page, /Política aprovada institucionalmente/);
  });

  it("informa direitos, contatos e os serviços técnicos declarados", async () => {
    const page = await readFile("src/app/politica-de-privacidade/page.tsx", "utf8");
    assert.match(page, /ouvidoria@ufba\.br/);
    assert.match(page, /Você pode confirmar o tratamento/);
    assert.match(page, /Supabase/);
    assert.match(page, /Vercel/);
  });

  it("explica o expurgo definido para o Nada Consta", async () => {
    const page = await readFile("src/app/politica-de-privacidade/page.tsx", "utf8");
    assert.match(page, /60 dias após o encerramento/);
    assert.match(page, /PDF completo não é enviado ao Pronto/);
    assert.match(page, /no total, por 100 anos/);
    assert.match(page, /é removido 60 dias após o encerramento/);
    assert.match(page, /logs técnicos: 6 meses/);
    assert.match(page, /backups: 90 dias/);
  });

  it("usa acordeões nativos para os detalhes", async () => {
    const page = await readFile("src/app/politica-de-privacidade/page.tsx", "utf8");
    assert.match(page, /<details open>/);
    assert.match(page, /<summary>/);
  });
});
