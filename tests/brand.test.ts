import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

test("a marca compartilhada alterna os logos oficiais por tema", async () => {
  const [brand, footer, css] = await Promise.all([readFile("src/components/brand.tsx", "utf8"), readFile("src/components/site-footer.tsx", "utf8"), readFile("src/app/globals.css", "utf8")]);
  assert.match(brand, /logo-pronto-light\.png/);
  assert.match(brand, /logo-pronto-dark\.png/);
  assert.match(brand, /Biblioteca FAUFBA/);
  assert.match(footer, /OfficialLibraryLogo/);
  assert.match(css, /dashboard-nav \.brand__image--dark/);
});
