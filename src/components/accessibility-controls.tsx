"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeSwitcher } from "./theme-switcher";

type TextScale = "normal" | "large" | "larger";

const scales: TextScale[] = ["normal", "large", "larger"];

function applyPreferences(scale: TextScale, highContrast: boolean) {
  document.documentElement.dataset.textScale = scale;
  document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
}

export function AccessibilityControls() {
  const [scale, setScale] = useState<TextScale>("normal");
  const [highContrast, setHighContrast] = useState(false);
  const hasUserChangedPreference = useRef(false);

  useEffect(() => {
    const savedScale = localStorage.getItem("pronto-text-scale");
    const initialScale = scales.includes(savedScale as TextScale) ? savedScale as TextScale : "normal";
    const initialContrast = localStorage.getItem("pronto-high-contrast") === "true";
    if (!hasUserChangedPreference.current) {
      setScale(initialScale);
      setHighContrast(initialContrast);
      applyPreferences(initialScale, initialContrast);
    }
  }, []);

  function changeScale(next: TextScale) {
    hasUserChangedPreference.current = true;
    setScale(next);
    localStorage.setItem("pronto-text-scale", next);
    applyPreferences(next, highContrast);
  }

  function changeContrast() {
    hasUserChangedPreference.current = true;
    const next = !highContrast;
    setHighContrast(next);
    localStorage.setItem("pronto-high-contrast", String(next));
    applyPreferences(scale, next);
  }

  const scaleIndex = scales.indexOf(scale);

  return (
    <nav className="accessibility-bar" aria-label="Recursos de acessibilidade">
      <div className="container accessibility-bar__inner">
        <div className="accessibility-bar__links">
          <a href="#conteudo">Ir para o conteúdo <span aria-hidden="true">[1]</span></a>
          <a href="#menu-principal" accessKey="2">Ir para o menu <span aria-hidden="true">[2]</span></a>
          <a href="/acessibilidade" accessKey="5">Acessibilidade <span aria-hidden="true">[5]</span></a>
        </div>
        <div className="accessibility-bar__controls" role="group" aria-label="Ajustes de visualização">
          <button type="button" onClick={() => changeScale(scales[Math.max(0, scaleIndex - 1)])} disabled={scaleIndex === 0} aria-label="Diminuir tamanho do texto" title="Diminuir texto">A−</button>
          <button type="button" onClick={() => changeScale("normal")} disabled={scale === "normal"} aria-label="Usar tamanho padrão do texto" title="Tamanho padrão">A</button>
          <button type="button" onClick={() => changeScale(scales[Math.min(scales.length - 1, scaleIndex + 1)])} disabled={scaleIndex === scales.length - 1} aria-label="Aumentar tamanho do texto" title="Aumentar texto">A+</button>
          <button type="button" onClick={changeContrast} accessKey="4" aria-pressed={highContrast} aria-label="Alternar alto contraste" title="Alto contraste">Contraste <span aria-hidden="true">[4]</span></button>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
