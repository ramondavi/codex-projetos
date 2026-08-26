"use client";

import { useEffect, useState } from "react";

type ThemePreference = "light" | "dark";

function applyTheme(preference: ThemePreference) {
  document.documentElement.dataset.theme = preference;
  document.documentElement.style.colorScheme = preference;
}

export function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pronto-theme");
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const initial: ThemePreference = saved === "light" || saved === "dark"
      ? saved
      : media.matches ? "dark" : "light";
    setPreference(initial);
    applyTheme(initial);

    const syncSystem = () => {
      const current = localStorage.getItem("pronto-theme");
      if (current !== "light" && current !== "dark") {
        const systemTheme = media.matches ? "dark" : "light";
        setPreference(systemTheme);
        applyTheme(systemTheme);
      }
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
    <div className="theme-switcher" role="group" aria-label="Tema da interface">
      <button type="button" aria-label="Usar tema claro" title="Tema claro" aria-pressed={preference === "light"} onClick={() => update("light")}>
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></svg>
      </button>
      <button type="button" aria-label="Usar tema escuro" title="Tema escuro" aria-pressed={preference === "dark"} onClick={() => update("dark")}>
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/></svg>
      </button>
    </div>
  );
}
