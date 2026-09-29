"use client";

export const LITERARY_AVATARS = [
  "Machado de Assis", "Carolina Maria de Jesus", "Clarice Lispector", "Castro Alves", "Conceição Evaristo",
  "Lima Barreto", "Cecília Meireles", "Guimarães Rosa", "Jorge Amado", "Rachel de Queiroz",
  "Graciliano Ramos", "Cora Coralina", "Hilda Hilst", "Mário de Andrade", "Oswald de Andrade",
  "Lygia Fagundes Telles", "Ariano Suassuna", "José de Alencar", "Aluísio Azevedo", "Cruz e Sousa",
  "Manuel Bandeira", "Ana Cristina Cesar", "Adélia Prado", "Elisa Lucinda", "Ailton Krenak",
] as const;

const palettes = [
  { background: "#dcebe4", coat: "#315c60", accent: "#b99354" },
  { background: "#eee1d3", coat: "#704b69", accent: "#b65e5c" },
  { background: "#dfe5ef", coat: "#49607d", accent: "#7d9d67" },
] as const;
const skinTones = ["#9c6348", "#8b4d36", "#dfa67d", "#c78a64", "#8a513c", "#a16b50", "#d4a17f", "#b2775b"];
const hairTones = ["#29272e", "#4b302e", "#9c6746", "#382d3e", "#ded4bb"];

export function avatarChoiceFor(id: string, choice?: number | null) {
  if (typeof choice === "number" && Number.isInteger(choice) && choice >= 0 && choice < 75) return choice;
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 75;
}

export function LiteraryAvatar({ id, label, choice, small = false }: { id: string; label: string; choice?: number | null; small?: boolean }) {
  const selected = avatarChoiceFor(id, choice);
  const face = Math.floor(selected / 3);
  const palette = palettes[selected % 3];
  const skin = skinTones[face % skinTones.length];
  const hair = hairTones[(face * 3) % hairTones.length];
  const hairstyle = face % 5;
  const glasses = [0, 5, 7, 10, 13, 16, 18, 20].includes(face);
  const facialHair = [0, 3, 5, 7, 8, 10, 13, 14, 16, 17, 18, 19, 20].includes(face);
  const headwrap = [1, 4, 11, 23, 24].includes(face);
  const earrings = [2, 6, 9, 12, 15, 21, 22, 23].includes(face);
  return <span className={`literary-avatar${small ? " literary-avatar--small" : ""}`} role="img" aria-label={`Avatar de ${label}, inspirado em ${LITERARY_AVATARS[face]}, cor ${selected % 3 + 1}`}>
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="31" fill={palette.background} />
      <path d="M5 63c2-13 12-20 27-20s25 7 27 20" fill={palette.coat} />
      <path d="M27 42h10v9H27z" fill={skin} />
      {hairstyle === 0 && <path d="M15 29C14 13 21 5 32 5s18 8 17 24l-5 15-5-10H25l-6 10z" fill={hair} />}
      {hairstyle === 1 && <path d="M14 30c-2-15 6-23 18-23s20 8 18 23l-5-7-26 1z" fill={hair} />}
      {hairstyle === 2 && <path d="M18 25C17 13 23 7 32 7s15 6 14 18l-4-5-21 4z" fill={hair} />}
      {hairstyle === 3 && <path d="M14 31c0-16 7-25 18-25s18 9 18 25l-4-8-28 2z" fill={hair} />}
      {hairstyle === 4 && <path d="M17 29c-1-13 6-22 15-22s16 9 15 22l-6-8-18 1z" fill={hair} />}
      <ellipse cx="32" cy="29" rx="14.5" ry="18" fill={skin} />
      <path d={hairstyle % 2 ? "M18 22q14-15 28 0l-3 5q-11-7-22 0z" : "M19 20q13-15 26 1l-2 6q-12-7-23-1z"} fill={hair} />
      {headwrap && <path d="M14 18c7-13 27-15 36 1l-5 6c-8-7-19-8-27 1z" fill={palette.accent} />}
      <path d="M23 28h5m8 0h5" stroke="#302b2d" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 29l-2 7h4" fill="none" stroke="#875c4b" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M27 39q5 3 10 0" fill="none" stroke="#774c44" strokeWidth="1.4" strokeLinecap="round" />
      {glasses && <><circle cx="25.5" cy="29" r="5.5" fill="none" stroke="#37333b" strokeWidth="1.5" /><circle cx="38.5" cy="29" r="5.5" fill="none" stroke="#37333b" strokeWidth="1.5" /><path d="M31 29h2" stroke="#37333b" strokeWidth="1.5" /></>}
      {facialHair && <path d="M26 37q3-3 6-1 3-2 6 1-4 3-6 1-2 2-6-1" fill={hair} />}
      {earrings && <><circle cx="17" cy="35" r="2" fill={palette.accent} /><circle cx="47" cy="35" r="2" fill={palette.accent} /></>}
      <circle cx="32" cy="32" r="31" fill="none" stroke="var(--institutional)" strokeOpacity=".35" strokeWidth="2" />
    </svg>
  </span>;
}
