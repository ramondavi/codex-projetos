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

  async function choose(choice: number) {
    if (saving) return;
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.rpc("choose_staff_avatar", { target_choice: choice });
    setSaving(false);
    if (updateError) { setError("Não foi possível salvar o avatar. Tente novamente."); return; }
    setSelected(choice);
    router.refresh();
  }

  return <section className="panel staff-avatar-picker" aria-labelledby="staff-avatar-picker-title">
    <div><p className="eyebrow">Minha conta</p><h2 id="staff-avatar-picker-title">Escolher avatar</h2><p>Escolha um retrato inspirado na literatura brasileira. Cada rosto tem três cores.</p></div>
    <div className="staff-avatar-picker__current"><LiteraryAvatar id={userId} label={fullName} choice={selected} /><span>Avatar atual: <strong>{LITERARY_AVATARS[Math.floor(selected / 3)]}</strong>, cor {selected % 3 + 1}</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="staff-avatar-picker__catalog">
      {LITERARY_AVATARS.map((name, index) => <div className="staff-avatar-picker__row" key={name}><strong>{name}</strong><div role="group" aria-label={`Cores de ${name}`}>{[0, 1, 2].map((color) => {
        const choice = index * 3 + color;
        return <button key={choice} type="button" className={selected === choice ? "is-selected" : ""} aria-label={`${name}, cor ${color + 1}${selected === choice ? ", selecionado" : ""}`} aria-pressed={selected === choice} disabled={saving} onClick={() => void choose(choice)}><LiteraryAvatar id={userId} label={name} choice={choice} /></button>;
      })}</div></div>)}
    </div>
  </section>;
}
