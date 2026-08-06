"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { canChangeAuthenticatedEmail, isUfbaEmail, normalizeEmail, normalizedSignupMetadata, validateEmailChange, validateSignup } from "@/domain/auth/account";
import { createClient } from "@/lib/supabase/server";

function destination(path: string, kind: "error" | "message", text: string) {
  return `${path}?${kind}=${encodeURIComponent(text)}`;
}

async function siteOrigin() {
  const headerStore = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL ?? headerStore.get("origin") ?? "http://localhost:3000";
}

export async function signup(formData: FormData) {
  if (!process.env.PRIVACY_NOTICE_VERSION) {
    redirect(destination("/cadastro", "error", "O cadastro será liberado após a validação institucional do aviso de privacidade."));
  }
  const input = {
    fullName: String(formData.get("name") ?? ""),
    cpf: String(formData.get("cpf") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
    privacyAccepted: formData.get("privacyAccepted") === "on",
  };
  const validationError = validateSignup(input);
  if (validationError) redirect(destination("/cadastro", "error", validationError));

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: normalizeEmail(input.email),
    password: input.password,
    options: {
      data: normalizedSignupMetadata(input),
      emailRedirectTo: `${await siteOrigin()}/auth/callback`,
    },
  });
  if (error) redirect(destination("/cadastro", "error", "Não foi possível criar a conta. Confira os dados ou tente novamente."));
  redirect(destination("/entrar", "message", "Conta criada. Confirme seu e-mail @ufba.br antes de entrar."));
}

export async function login(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!isUfbaEmail(email) || !password) redirect(destination("/entrar", "error", "Informe e-mail institucional e senha."));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect(destination("/entrar", "error", "E-mail ou senha inválidos, ou e-mail ainda não confirmado."));

  const { data: profile } = await supabase.from("profiles").select("status").eq("id", data.user.id).single();
  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect(destination("/entrar", "error", "Esta conta não está ativa. Procure a biblioteca."));
  }
  redirect("/painel");
}

export async function requestPasswordReset(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isUfbaEmail(email)) redirect(destination("/recuperar-senha", "error", "Use seu endereço institucional @ufba.br."));
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${await siteOrigin()}/auth/callback?next=/redefinir-senha` });
  redirect(destination("/recuperar-senha", "message", "Se o endereço estiver cadastrado, enviaremos as instruções."));
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("passwordConfirmation") ?? "");
  if (password.length < 8) redirect(destination("/redefinir-senha", "error", "A senha deve ter pelo menos 8 caracteres."));
  if (password !== confirmation) redirect(destination("/redefinir-senha", "error", "As senhas não coincidem."));
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(destination("/redefinir-senha", "error", "O link expirou ou não foi possível atualizar a senha."));
  redirect(destination("/entrar", "message", "Senha atualizada. Você já pode entrar."));
}

export async function requestEmailChange(formData: FormData) {
  const newEmail = normalizeEmail(String(formData.get("email") ?? ""));
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) redirect(destination("/entrar", "error", "Sua sessão expirou. Entre novamente para alterar o e-mail."));

  const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).single();
  if (!canChangeAuthenticatedEmail(profile?.status)) {
    await supabase.auth.signOut();
    redirect(destination("/entrar", "error", "Não foi possível continuar. Entre novamente ou procure a biblioteca."));
  }

  const validationError = validateEmailChange(newEmail, user.email);
  if (validationError) redirect(destination("/painel/conta", "error", validationError));

  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: `${await siteOrigin()}/auth/callback?next=/painel/conta` },
  );
  if (error) redirect(destination("/painel/conta", "error", "Não foi possível solicitar a alteração do e-mail. Confira o endereço ou tente novamente."));
  redirect(destination("/painel/conta", "message", "Solicitação enviada. Conclua as confirmações de segurança enviadas pelo Supabase para alterar o e-mail."));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
