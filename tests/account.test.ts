import assert from "node:assert/strict";
import test from "node:test";
import { isUfbaEmail, normalizeEmail, normalizedSignupMetadata, validateSignup } from "../src/domain/auth/account.ts";

test("accepts only the exact UFBA email domain", () => {
  assert.equal(isUfbaEmail(" pessoa@ufba.br "), true);
  assert.equal(isUfbaEmail("pessoa@aluno.ufba.br"), false);
  assert.equal(isUfbaEmail("pessoa@ufba.br.example.com"), false);
});

test("normalizes institutional email", () => {
  assert.equal(normalizeEmail(" Pessoa@UFBA.BR "), "pessoa@ufba.br");
});

test("validates all signup decisions together", () => {
  assert.equal(validateSignup({
    fullName: "Maria da Silva",
    cpf: "529.982.247-25",
    email: "maria@ufba.br",
    password: "uma-senha-segura",
    passwordConfirmation: "uma-senha-segura",
    privacyAccepted: true,
  }), null);
});

test("student metadata never accepts a client-provided role", () => {
  const metadata = normalizedSignupMetadata({
    fullName: "Maria da Silva", cpf: "529.982.247-25", email: "maria@ufba.br",
    password: "uma-senha-segura", passwordConfirmation: "uma-senha-segura", privacyAccepted: true,
  });
  assert.deepEqual(metadata, { registration_source: "student", full_name: "Maria da Silva", cpf: "52998224725" });
  assert.equal("role" in metadata, false);
});
