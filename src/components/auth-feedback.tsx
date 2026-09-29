import { AppIcon } from "./app-icon";

export function AuthFeedback({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  return <p className={`auth-feedback auth-feedback--${error ? "error" : "success"}`} role={error ? "alert" : "status"}><AppIcon name={error ? "close" : "check"} aria-hidden="true" /><span>{error ?? message}</span></p>;
}
