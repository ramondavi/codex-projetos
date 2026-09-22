import { createClient } from "@/lib/supabase/server";
import { helpArticles, knowledgeText, normalizeKnowledge, quickDoubts, type KnowledgeItem } from "@/lib/knowledge-base";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const context = new URL(request.url).searchParams.get("context");
  const supabase = await createClient();
  const { data } = await supabase.from("frequently_asked_questions").select("id,question,answer").eq("active", true).order("position");
  const faqs: KnowledgeItem[] = (data ?? []).map((faq) => ({ id: faq.id, kind: "Pergunta frequente", category: "FAQ", title: faq.question, summary: faq.answer }));
  const term = normalizeKnowledge(query);
  const source = [...quickDoubts, ...faqs, ...helpArticles];
  const contextual = context === "atendimento" ? helpArticles.filter((item) => item.category === "Análise") : context === "administracao" ? [...faqs.slice(0, 1), ...helpArticles.slice(0, 2)] : context === "estudante" ? [...quickDoubts, ...helpArticles] : source;
  const results = (term.length >= 2 ? source.filter((item) => normalizeKnowledge(knowledgeText(item)).includes(term)) : contextual).slice(0, 8).map(({ body: _body, sections: _sections, ...item }) => item);
  return Response.json({ results });
}
