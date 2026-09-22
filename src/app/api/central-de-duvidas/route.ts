import { createClient } from "@/lib/supabase/server";
import { helpArticles, normalizeKnowledge, quickDoubts, type KnowledgeItem } from "@/lib/knowledge-base";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return Response.json({ results: [] });
  const supabase = await createClient();
  const { data } = await supabase.from("frequently_asked_questions").select("id,question,answer").eq("active", true).order("position");
  const faqs: KnowledgeItem[] = (data ?? []).map((faq) => ({ id: faq.id, kind: "Pergunta frequente", category: "FAQ", title: faq.question, summary: faq.answer }));
  const term = normalizeKnowledge(query);
  const results = [...quickDoubts, ...faqs, ...helpArticles].filter((item) => normalizeKnowledge(`${item.title} ${item.summary} ${item.body?.join(" ") ?? ""}`).includes(term)).slice(0, 8).map(({ body: _body, ...item }) => item);
  return Response.json({ results });
}
