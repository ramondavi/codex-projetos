import { readFile, stat } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

test("oferece breadcrumbs, favicon e metadados de compartilhamento", async () => {
  const [layout, breadcrumbs, icon, og, robots, sitemap, dashboardLayout, notFound, home, header, css, help, search, studentForm, article] = await Promise.all([
    readFile("src/app/layout.tsx", "utf8"), readFile("src/components/breadcrumbs.tsx", "utf8"),
    stat("src/app/icon.png"), readFile("src/app/opengraph-image.tsx", "utf8"),
    readFile("src/app/robots.ts", "utf8"), readFile("src/app/sitemap.ts", "utf8"), readFile("src/app/painel/layout.tsx", "utf8"), readFile("src/app/not-found.tsx", "utf8"), readFile("src/app/page.tsx", "utf8"), readFile("src/components/site-header.tsx", "utf8"), readFile("src/app/globals.css", "utf8"), readFile("src/app/ajuda/page.tsx", "utf8"), readFile("src/components/help-search.tsx", "utf8"), readFile("src/components/student-request-form.tsx", "utf8"), readFile("src/app/ajuda/artigos/[slug]/page.tsx", "utf8"),
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
  assert.match(sitemap, /ajuda/);
  assert.match(dashboardLayout, /index: false/);
  assert.match(notFound, /Esta página saiu da estante/);
  assert.match(notFound, /Voltar ao início/);
  assert.match(home, /fallbackHomeFaqs/);
  assert.match(home, /homeFaqs/);
  assert.match(header, /AppIcon name="logout"/);
  assert.match(header, /Sair da conta/);
  assert.match(header, /site-header__access-greeting/);
  assert.match(header, /Olá, \$\{firstName\}/);
  assert.match(css, /grid-template-columns: auto max-content/);
  assert.match(help, /bibarq@ufba\.br/);
  assert.match(help, /3283-5888/);
  assert.match(search, /aria-autocomplete="list"/);
  assert.match(search, /api\/central-de-duvidas/);
  assert.match(studentForm, /HelpSearch compact/);
  assert.match(article, /generateStaticParams/);
});
