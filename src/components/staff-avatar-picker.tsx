"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LITERARY_AVATARS, LiteraryAvatar, avatarChoiceFor } from "./literary-avatar";

export function StaffAvatarPicker({ userId, fullName, currentChoice }: { userId: string; fullName: string; currentChoice: number | null }) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [selected, setSelected] = useState(() => avatarChoiceFor(userId, currentChoice));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const avatar = LITERARY_AVATARS.find((item) => item.slot * 3 === selected) ?? LITERARY_AVATARS[0];

  async function choose(choice: number) {
    if (saving || choice === selected) return;
    const previous = selected;
    setSelected(choice);
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.rpc("choose_staff_avatar", { target_choice: choice });
    setSaving(false);
    if (updateError) {
      setSelected(previous);
      setError("Não foi possível salvar o avatar. Tente novamente.");
      return;
    }
    router.refresh();
  }

  return <section className="panel staff-avatar-picker" aria-labelledby="staff-avatar-picker-title">
    <div className="staff-avatar-picker__heading"><div><p className="eyebrow">Minha conta</p><h2 id="staff-avatar-picker-title">Escolher avatar</h2><p>Toque em um retrato para usar na sua conta e conhecer a pessoa retratada.</p></div><span className="staff-avatar-picker__status" role="status">{saving ? "Salvando…" : "Escolha salva automaticamente"}</span></div>
    <div className="staff-avatar-picker__featured" aria-live="polite">
      <LiteraryAvatar id={userId} label={fullName} choice={selected} />
      <div className="staff-avatar-picker__bio"><p className="eyebrow">Seu avatar</p><h3>{avatar.name} <span>({avatar.years})</span></h3><p>{avatar.bio}</p><a href={avatar.source} target="_blank" rel="noreferrer">Fonte da biografia ↗</a></div>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="staff-avatar-picker__gallery" role="group" aria-label="Retratos disponíveis">
      {[...LITERARY_AVATARS].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")).map((item) => {
        const choice = item.slot * 3;
        return <button key={item.name} type="button" className={selected === choice ? "is-selected" : ""} aria-label={`Escolher ${item.name}${selected === choice ? ", selecionado" : ""}`} aria-pressed={selected === choice} disabled={saving} onClick={() => void choose(choice)}><LiteraryAvatar id={userId} label={item.name} choice={choice} /><span>{item.name}</span></button>;
      })}
    </div>
  </section>;
}
