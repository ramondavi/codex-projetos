import { isValidCpf, normalizeCpf } from "../students/cpf.ts";

export const UFBA_EMAIL_DOMAIN = "ufba.br";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isUfbaEmail(value: string) {
  const email = normalizeEmail(value);
  const [localPart, domain, ...extra] = email.split("@");
  return Boolean(localPart && domain === UFBA_EMAIL_DOMAIN && extra.length === 0);
}

export function validateEmailChange(newEmail: string, currentEmail: string) {
  if (!isUfbaEmail(newEmail)) return "Use um novo endereço institucional @ufba.br.";
  if (normalizeEmail(newEmail) === normalizeEmail(currentEmail)) return "O novo e-mail deve ser diferente do endereço atual.";
  return null;
}

export type SignupInput = {
  fullName: string;
  cpf: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  privacyAccepted: boolean;
};

export function validateSignup(input: SignupInput) {
  if (input.fullName.trim().length < 3) return "Informe seu nome completo.";
  if (!isValidCpf(input.cpf)) return "Informe um CPF válido.";
  if (!isUfbaEmail(input.email)) return "Use seu endereço institucional @ufba.br.";
  if (input.password.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (input.password !== input.passwordConfirmation) return "As senhas não coincidem.";
  if (!input.privacyAccepted) return "É necessário aceitar o aviso de privacidade.";
  return null;
}

export function normalizedSignupMetadata(input: SignupInput) {
  return { registration_source: "student", full_name: input.fullName.trim(), cpf: normalizeCpf(input.cpf) };
}
