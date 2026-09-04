import { readFile, stat } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

test("oferece breadcrumbs, favicon e metadados de compartilhamento", async () => {
  const [layout, breadcrumbs, icon, og, robots, sitemap, dashboardLayout] = await Promise.all([
    readFile("src/app/layout.tsx", "utf8"), readFile("src/components/breadcrumbs.tsx", "utf8"),
    stat("src/app/icon.png"), readFile("src/app/opengraph-image.tsx", "utf8"),
    readFile("src/app/robots.ts", "utf8"), readFile("src/app/sitemap.ts", "utf8"), readFile("src/app/painel/layout.tsx", "utf8"),
  ]);
  assert.match(layout, /openGraph/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /summary_large_image/);
  assert.match(layout, /https:\/\/prontobib\.vercel\.app/);
  assert.match(layout, /application\/ld\+json/);
  assert.match(breadcrumbs, /Caminho de navegação/);
  assert.match(breadcrumbs, /DashboardBreadcrumbs/);
  assert.ok(icon.size > 0);
  assert.match(og, /ImageResponse/);
  assert.match(robots, /sitemap/);
  assert.match(robots, /\/painel\//);
  assert.match(sitemap, /perguntas-frequentes/);
  assert.match(dashboardLayout, /index: false/);
});
