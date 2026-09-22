import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/entrar", "/cadastro", "/recuperar-senha", "/perguntas-frequentes"]) {
  test(`${path} não tem violações críticas ou sérias`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
  });
}

test("recursos de acessibilidade preservam as preferências", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Aumentar tamanho do texto" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-text-scale", "large");
  await page.getByRole("button", { name: "Alternar alto contraste" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-text-scale", "large");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
});

test("navegação por teclado alcança o conteúdo", async ({ page }) => {
  await page.goto("/");
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => document.activeElement?.getAttribute("href") === "#conteudo")) break;
  }
  await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe("#conteudo");
  await page.keyboard.press("Enter");
  await expect(page.locator("#conteudo")).toBeFocused();
});

test("barras públicas compartilham as mesmas margens", async ({ page }) => {
  await page.goto("/");
  await page.locator("#barra-brasil .conteudo-barra-brasil").waitFor({ state: "visible" });
  const offsets = await page.evaluate(() => ["#barra-brasil .conteudo-barra-brasil", ".accessibility-bar__inner", ".site-header__inner"].map((selector) => {
    const { left, right } = document.querySelector(selector)!.getBoundingClientRect();
    return { left: Math.round(left), right: Math.round(right) };
  }));
  expect(offsets.every(({ left, right }) => left === offsets[0].left && right === offsets[0].right)).toBe(true);
});

test("links do rodapé público ocupam uma linha no desktop", async ({ page }) => {
  if ((page.viewportSize()?.width ?? 0) < 900) return;
  await page.goto("/");
  const footerLinks = page.locator(".global-footer__nav a");
  await footerLinks.first().waitFor({ state: "visible" });
  const rows = await footerLinks.evaluateAll((links) => new Set(links.map((link) => Math.round(link.getBoundingClientRect().top))).size);
  expect(rows).toBe(1);
});

test("páginas públicas não criam rolagem horizontal", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("tema explícito persiste e substitui a preferência do sistema", async ({ page }) => {
  test.slow();
  await page.goto("/");
  const darkTheme = page.getByRole("button", { name: "Usar tema escuro" });
  const lightTheme = page.getByRole("button", { name: "Usar tema claro" });
  await darkTheme.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(darkTheme).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(darkTheme).toHaveAttribute("aria-pressed", "true");
  await lightTheme.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(lightTheme).toHaveAttribute("aria-pressed", "true");
});

test("entrada continua utilizável sob latência simulada", async ({ page }) => {
  await page.route("**/*", async route => {
    await new Promise(resolve => setTimeout(resolve, 120));
    await route.continue();
  });
  await page.goto("/entrar");
  await expect(page.getByRole("heading", { name: "Entre na sua conta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeEnabled();
});
