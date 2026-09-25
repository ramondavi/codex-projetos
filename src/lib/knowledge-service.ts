import "server-only";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@/lib/supabase/server";
import { initialKnowledgeEntries, type KnowledgeEntry, type KnowledgeItem } from "@/lib/knowledge-base";
import { getInterfaceLanguage } from "@/lib/server-language";

const fields = "id,slug,kind,title,summary,body_html,translations,category,audiences,active,position,featured_position,created_at,updated_at,published_at";

function localizedEntry(entry: KnowledgeEntry, language: string): KnowledgeEntry {
  const translated = entry.translations?.[language];
  return translated?.title && translated.summary && translated.body_html
    ? { ...entry, title: translated.title, summary: translated.summary, body_html: translated.body_html }
    : entry;
}

function protectPublicContacts(entry: KnowledgeEntry): KnowledgeEntry {
  const hideContacts = (value: string) => value
    .replace(/mailto:[^"'\s<>]+/gi, "/ajuda#contato-ajuda")
    .replace(/tel:[^"'\s<>]+/gi, "/ajuda#contato-ajuda")
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "e-mail disponível na Central de Ajuda")
    .replace(/(?:\+?55[\s.-]?)?\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g, "telefone disponível na Central de Ajuda");
  return { ...entry, title: hideContacts(entry.title), summary: hideContacts(entry.summary), category: hideContacts(entry.category), body_html: hideContacts(entry.body_html) };
}

export function safeKnowledgeHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["section", "span", "p", "br", "h2", "h3", "strong", "em", "s", "ul", "ol", "li", "blockquote", "hr", "a", "img"],
    allowedAttributes: { section: ["class"], span: ["class", "aria-hidden"], ol: ["class"], a: ["href", "target", "rel"], img: ["src", "alt", "title", "width", "height"] },
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    transformTags: { a: (_tag, attrs) => ({ tagName: "a", attribs: { href: attrs.href ?? "#", target: "_blank", rel: "noopener noreferrer" } }), img: (_tag, attrs) => ({ tagName: "img", attribs: { src: attrs.src ?? "", alt: attrs.alt ?? "", loading: "lazy" } }) },
  });
}

export function toKnowledgeItem(entry: KnowledgeEntry): KnowledgeItem {
  return {
    id: entry.id, slug: entry.slug ?? undefined,
    kind: entry.kind === "faq" ? "Pergunta frequente" : entry.kind === "answer" ? "Dúvida rápida" : "Artigo de ajuda",
    title: entry.title, summary: entry.summary, category: entry.category,
    bodyHtml: safeKnowledgeHtml(entry.body_html),
  };
}

export async function getPublishedKnowledge(publicOnly = true): Promise<KnowledgeEntry[]> {
  const supabase = await createClient();
  let query = supabase.from("knowledge_base_entries").select(fields).eq("active", true).order("position");
  if (publicOnly) query = query.contains("audiences", ["public"]);
  const { data, error } = await query;
  if (!error) { const language = await getInterfaceLanguage(); return (data as KnowledgeEntry[]).map((entry) => { const localized = localizedEntry(entry, language); return publicOnly ? protectPublicContacts(localized) : localized; }); }
  const { data: faqs } = await supabase.from("frequently_asked_questions")
    .select("id,question,answer,active,position,featured_position,created_at,updated_at").eq("active", true).order("position");
  const defaults = faqs?.length ? faqs : [
    { id: "fallback-1", question: "Quem pode usar o Pronto!?", answer: "Estudantes da UFBA que precisam solicitar ficha catalográfica e realizar o autodepósito, além da equipe autorizada da BIB/FA.", active: true, position: 10 },
    { id: "fallback-2", question: "O trabalho completo é enviado ao Pronto!?", answer: "Não. O estudante informa um link público para análise e o PDF completo permanece no próprio dispositivo durante a mesclagem da ficha.", active: true, position: 20 },
    { id: "fallback-3", question: "Quando posso baixar a ficha?", answer: "Depois que a ficha for homologada pela biblioteca e o Nada Consta for aprovado.", active: true, position: 30 },
  ];
  const initial = initialKnowledgeEntries(defaults);
  return publicOnly ? initial.map(protectPublicContacts) : initial;
}
