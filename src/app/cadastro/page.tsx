import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { authPageMetadata } from "@/lib/auth-page-metadata";
import { SignupForm } from "@/components/signup-form";

export const generateMetadata = () => authPageMetadata("signup");

export default function SignupPage() {
  return (
    <AuthShell title="Crie sua conta" description="Sua conta é única. A matrícula será informada em cada nova solicitação.">
      <SignupForm />
      <p className="auth-card__footer">Já tem uma conta? <Link href="/entrar">Entrar</Link></p>
    </AuthShell>
  );
}
