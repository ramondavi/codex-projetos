"use client";

import { useEffect, useState } from "react";

type ThemePreference = "light" | "dark" | "system";

const labels: Record<ThemePreference, string> = {
  light: "Claro",
  dark: "Escuro",
  system: "Sistema",
};

function applyTheme(preference: ThemePreference) {
  const dark =
    preference === "dark" ||
    (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const saved = localStorage.getItem("pronto-theme") as ThemePreference | null;
    const initial = saved && saved in labels ? saved : "system";
    setPreference(initial);
    applyTheme(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => {
      if ((localStorage.getItem("pronto-theme") ?? "system") === "system") applyTheme("system");
    };
    media.addEventListener("change", syncSystem);
    return () => media.removeEventListener("change", syncSystem);
  }, []);

  function update(preference: ThemePreference) {
    setPreference(preference);
    localStorage.setItem("pronto-theme", preference);
    applyTheme(preference);
  }

  return (
    <label className="theme-switcher">
      <span className="sr-only">Tema da interface</span>
      <select value={preference} onChange={(event) => update(event.target.value as ThemePreference)}>
        {(Object.keys(labels) as ThemePreference[]).map((value) => (
          <option value={value} key={value}>{labels[value]}</option>
        ))}
      </select>
    </label>
  );
}
