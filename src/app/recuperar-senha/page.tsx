import { AuthShell } from "@/components/auth-shell";
import { AuthFeedback } from "@/components/auth-feedback";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";

export default async function PasswordRecoveryPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  return (
    <AuthShell title="Recupere sua senha" description="Enviaremos as instruções se o endereço estiver cadastrado.">
      <AuthFeedback error={error} message={message} />
      <PasswordRecoveryForm />
    </AuthShell>
  );
}
