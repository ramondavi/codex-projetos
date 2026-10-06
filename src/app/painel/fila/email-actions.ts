"use server";

import nodemailer from "nodemailer";
import path from "node:path";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { transactionalEmailHtml, transactionalEmailText } from "@/lib/email-html";

type OutboxEmail = { email_id: string; recipient: string; subject: string; text_body: string };

export async function processLocalEmailOutbox() {
  if (process.env.NODE_ENV !== "development") throw new Error("Local email delivery is disabled outside development.");
  const supabase = await createClient();
  const [{ data: requestEmails, error: requestError }, { data: accountEmails, error: accountError }] = await Promise.all([
    supabase.rpc("claim_local_email_outbox", { batch_limit: 20 }),
    supabase.rpc("claim_local_account_notification_outbox", { batch_limit: 20 }),
  ]);
  if (requestError || accountError) redirect("/painel/fila?emails=error");
  const transporter = nodemailer.createTransport({ host: "127.0.0.1", port: 54325, secure: false, ignoreTLS: true });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let failed = false;
  for (const [email, completion] of [
    ...((requestEmails ?? []) as OutboxEmail[]).map((email) => [email, "complete_local_email_delivery"] as const),
    ...((accountEmails ?? []) as OutboxEmail[]).map((email) => [email, "complete_local_account_notification_delivery"] as const),
  ]) {
    try {
      await transporter.sendMail({ from: "BIB/FAUFBA | Pronto! <pronto@localhost>", to: email.recipient, subject: email.subject, text: transactionalEmailText(email.subject, email.text_body, siteUrl), html: transactionalEmailHtml(email.subject, email.text_body, siteUrl), attachments: [{ filename: "logo-pronto.png", path: path.join(process.cwd(), "public", "logo-pronto-v2-light.png"), cid: "pronto-logo" }] });
      await supabase.rpc(completion, { target_email_id: email.email_id, succeeded: true, error_message: null });
    } catch (deliveryError) {
      failed = true;
      await supabase.rpc(completion, { target_email_id: email.email_id, succeeded: false, error_message: deliveryError instanceof Error ? deliveryError.message : "delivery_failed" });
    }
  }
  redirect(`/painel/fila?emails=${failed ? "error" : "sent"}`);
}
