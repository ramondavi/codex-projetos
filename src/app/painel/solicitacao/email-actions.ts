"use server";

import nodemailer from "nodemailer";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { transactionalEmailHtml, transactionalEmailText } from "@/lib/email-html";

type OpeningEmail = { email_id: string; recipient: string; subject: string; text_body: string };

export async function deliverLocalOpeningEmail(requestId: string): Promise<"sent" | "already_sent" | "error"> {
  if (process.env.NODE_ENV !== "development" || !/^[0-9a-f-]{36}$/i.test(requestId)) return "error";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "error";
  const { data: ownedRequest } = await supabase.from("cataloging_requests").select("id").eq("id", requestId).maybeSingle();
  if (!ownedRequest) return "error";
  await supabase.rpc("ensure_own_coordination_opening_email", { target_request_id: requestId });
  const { data, error: claimError } = await supabase.rpc("claim_own_local_opening_email", { target_request_id: requestId });
  if (claimError) return "error";
  const email = (data as OpeningEmail[] | null)?.[0];
  if (!email) return "already_sent";
  const transporter = nodemailer.createTransport({ host: "127.0.0.1", port: 54325, secure: false, ignoreTLS: true });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    await transporter.sendMail({ from: "BIB/FAUFBA | Pronto! <pronto@localhost>", to: email.recipient, subject: email.subject, text: transactionalEmailText(email.subject, email.text_body, siteUrl), html: transactionalEmailHtml(email.subject, email.text_body, siteUrl), attachments: [{ filename: "logo-pronto.png", path: path.join(process.cwd(), "public", "logo-pronto-light.png"), cid: "pronto-logo" }] });
    await supabase.rpc("complete_own_local_opening_email", { target_email_id: email.email_id, succeeded: true, error_message: null });
    return "sent";
  } catch {
    await supabase.rpc("complete_own_local_opening_email", { target_email_id: email.email_id, succeeded: false, error_message: "local_delivery_failed" });
    return "error";
  }
}
