"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Entry = { cdu_code: string; description: string; composition_notes: string | null; auxiliary_codes: string[]; related_codes: string[]; source_reference: string | null; validated: boolean };

export function CduCatalogAdmin({ entries }: { entries: Entry[] }) {
  const [items, setItems] = useState(entries);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const supabase = createClient();
  async function save(entry: Entry, form: FormData) {
    setBusy(entry.cdu_code); setMessage("");
    const description = String(form.get("description") ?? "");
    const composition = String(form.get("composition") ?? "");
    const auxiliary = String(form.get("auxiliary") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
    const related = String(form.get("related") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
    const source = String(form.get("source") ?? "");
    const validated = form.get("validated") === "on";
    const { error } = await supabase.rpc("admin_save_cdu_code_description", { cdu_code_value: entry.cdu_code, description_value: description, composition_notes_value: composition, auxiliary_codes_value: auxiliary, related_codes_value: related, source_reference_value: source, validated_value: validated });
    if (error) setMessage("Não foi possível salvar o registro CDU.");
    else { setItems((current) => current.map((item) => item.cdu_code === entry.cdu_code ? { ...item, description, composition_notes: composition || null, auxiliary_codes: auxiliary, related_codes: related, source_reference: source || null, validated } : item)); setMessage("Registro CDU salvo e confirmado."); }
    setBusy("");
  }
  return <section className="panel admin-section cdu-catalog-admin"><p className="eyebrow">Vocabulário técnico</p><h2>Catálogo CDU</h2><p>Revise descrições e a memória de composição. Registros novos ficam pendentes até sua validação.</p>{message && <p className="auth-feedback" role="status">{message}</p>}<div className="admin-list">{items.map((entry) => <form className="admin-row admin-row--faq" key={entry.cdu_code} action={(form) => save(entry, form)}><strong>{entry.cdu_code}</strong><label className="admin-row--faq-question">Descrição<textarea name="description" required minLength={3} maxLength={1000} rows={2} defaultValue={entry.description} /></label><label className="admin-row--faq-answer">Memória de composição<textarea name="composition" maxLength={4000} rows={2} defaultValue={entry.composition_notes ?? ""} /></label><label>Auxiliares (separe por vírgula)<input name="auxiliary" defaultValue={entry.auxiliary_codes.join(", ")} /></label><label>Códigos relacionados<input name="related" defaultValue={entry.related_codes.join(", ")} /></label><label>Fonte consultada<input name="source" maxLength={1000} defaultValue={entry.source_reference ?? ""} /></label><label className="compact-check"><input name="validated" type="checkbox" defaultChecked={entry.validated} /> Validado</label><button className="button button--secondary button--small" disabled={busy === entry.cdu_code}>Salvar</button></form>)}</div></section>;
}
