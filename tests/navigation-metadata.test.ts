import { readFile, stat } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

test("oferece breadcrumbs, favicon e metadados de compartilhamento", async () => {
  const [layout, breadcrumbs, icon, og] = await Promise.all([
    readFile("src/app/layout.tsx", "utf8"), readFile("src/components/breadcrumbs.tsx", "utf8"),
    stat("src/app/icon.png"), readFile("src/app/opengraph-image.tsx", "utf8"),
  ]);
  assert.match(layout, /openGraph/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /summary_large_image/);
  assert.match(breadcrumbs, /Caminho de navegação/);
  assert.match(breadcrumbs, /DashboardBreadcrumbs/);
  assert.ok(icon.size > 0);
  assert.match(og, /ImageResponse/);
});
