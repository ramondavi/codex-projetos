"use server";

import nodemailer from "nodemailer";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type OutboxEmail = { email_id: string; recipient: string; subject: string; text_body: string };

export async function processLocalEmailOutbox() {
  if (process.env.NODE_ENV !== "development") throw new Error("Local email delivery is disabled outside development.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_local_email_outbox", { batch_limit: 20 });
  if (error) redirect("/painel/fila?emails=error");
  const transporter = nodemailer.createTransport({ host: "127.0.0.1", port: 54325, secure: false, ignoreTLS: true });
  let failed = false;
  for (const email of (data ?? []) as OutboxEmail[]) {
    try {
      await transporter.sendMail({ from: "Pronto! local <pronto@localhost>", to: email.recipient, subject: email.subject, text: email.text_body });
      await supabase.rpc("complete_local_email_delivery", { target_email_id: email.email_id, succeeded: true, error_message: null });
    } catch (deliveryError) {
      failed = true;
      await supabase.rpc("complete_local_email_delivery", { target_email_id: email.email_id, succeeded: false, error_message: deliveryError instanceof Error ? deliveryError.message : "delivery_failed" });
    }
  }
  redirect(`/painel/fila?emails=${failed ? "error" : "sent"}`);
}
