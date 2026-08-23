import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const form = readFileSync("src/components/password-recovery-form.tsx", "utf8");
const callback = readFileSync("src/app/auth/callback/route.ts", "utf8");
const config = readFileSync("supabase/config.toml", "utf8");

test("password recovery uses the browser PKCE client and the server callback", () => {
  assert.match(form, /createClient\(\)\.auth\.resetPasswordForEmail/);
  assert.match(form, /auth\/callback\?next=\/redefinir-senha/);
  assert.match(callback, /exchangeCodeForSession\(code\)/);
});

test("local Auth accepts both supported development origins", () => {
  assert.match(config, /site_url = "http:\/\/localhost:3000"/);
  assert.match(config, /"http:\/\/localhost:3000\/\*\*"/);
  assert.match(config, /"http:\/\/127\.0\.0\.1:3000\/\*\*"/);
});
