import { createClient } from "@/lib/supabase/server";
import { createFeedbackCsv, createFeedbackPdf, type FeedbackExportResponse } from "@/lib/feedback-export";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Entre novamente para exportar a pesquisa." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user.id).single();
  if (profile?.role !== "administrator" || profile.status !== "active") return Response.json({ error: "Acesso restrito à administração." }, { status: 403 });

  const format = new URL(request.url).searchParams.get("formato");
  if (format !== "csv" && format !== "pdf") return Response.json({ error: "Formato de exportação inválido." }, { status: 400 });

  const [{ data: stats, error: statsError }, { data: responseRows, error: responsesError }] = await Promise.all([
    supabase.rpc("feedback_campaign_stats"),
    supabase.from("feedback_responses").select("answers"),
  ]);
  if (statsError || responsesError || !stats || !responseRows) return Response.json({ error: "Não foi possível consultar as respostas da pesquisa." }, { status: 503 });
  const counts = stats as { invited?: number; responded?: number };
  if (counts.invited !== 50 || counts.responded !== 50 || responseRows.length !== 50) {
    return Response.json({ error: "A exportação será liberada quando as 50 pessoas convidadas tiverem respondido." }, { status: 403 });
  }

  const responses = responseRows as FeedbackExportResponse[];
  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": `attachment; filename="pronto-avaliacao-50-respostas.${format}"`,
    "X-Content-Type-Options": "nosniff",
  };
  try {
    if (format === "csv") return new Response(createFeedbackCsv(responses), { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" } });
    const bytes = await createFeedbackPdf(responses);
    return new Response(Uint8Array.from(bytes).buffer, { headers: { ...headers, "Content-Type": "application/pdf" } });
  } catch {
    return Response.json({ error: "Não foi possível preparar o arquivo. Tente novamente." }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}
