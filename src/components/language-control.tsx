"use client";

import { useState } from "react";
import { AppIcon } from "./app-icon";
import { useInterfaceLanguage } from "./interface-language";
import { languageLabels, supportedLanguages } from "@/lib/interface-language";

const messages = {
  pt: { label: "Idioma da interface", detected: "Idioma do dispositivo: {language}.", keep: "Manter idioma atual", change: "Mudar para {language}" },
  en: { label: "Interface language", detected: "Device language: {language}.", keep: "Keep current language", change: "Switch to {language}" },
  es: { label: "Idioma de la interfaz", detected: "Idioma del dispositivo: {language}.", keep: "Mantener idioma actual", change: "Cambiar a {language}" },
  de: { label: "Sprache der Oberfläche", detected: "Gerätesprache: {language}.", keep: "Aktuelle Sprache behalten", change: "Zu {language} wechseln" },
  fr: { label: "Langue de l’interface", detected: "Langue de l’appareil : {language}.", keep: "Garder cette langue", change: "Passer à {language}" },
  it: { label: "Lingua dell’interfaccia", detected: "Lingua del dispositivo: {language}.", keep: "Mantieni questa lingua", change: "Passa a {language}" },
};

export function LanguageControl() {
  const { language, deviceLanguage, hasPreference, setLanguage } = useInterfaceLanguage();
  const [dismissed, setDismissed] = useState(false);
  const message = messages[language];
  const showSuggestion = hasPreference && language !== deviceLanguage && !dismissed;
  return <div className="language-control">
    {showSuggestion && <div className="language-control__suggestion" role="status"><span>{message.detected.replace("{language}", languageLabels[deviceLanguage])}</span><button type="button" onClick={() => { setLanguage(deviceLanguage); setDismissed(true); }}>{message.change.replace("{language}", languageLabels[deviceLanguage])}</button><button type="button" onClick={() => setDismissed(true)}>{message.keep}</button></div>}
    <label className="language-control__select"><AppIcon name="globe" /><span className="sr-only">{message.label}</span><select aria-label={message.label} value={language} onChange={(event) => { setLanguage(event.target.value as typeof language); setDismissed(false); }}>{supportedLanguages.map((option) => <option key={option} value={option}>{languageLabels[option]}</option>)}</select></label>
  </div>;
}
