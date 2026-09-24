"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type InterfaceLanguage, normalizeLanguage } from "@/lib/interface-language";
import { useRouter } from "next/navigation";

const preferenceKey = "pronto-interface-language";

type LanguageContextValue = { language: InterfaceLanguage; deviceLanguage: InterfaceLanguage; hasPreference: boolean; setLanguage: (language: InterfaceLanguage) => void };
const LanguageContext = createContext<LanguageContextValue>({ language: "pt", deviceLanguage: "pt", hasPreference: false, setLanguage: () => undefined });

export function InterfaceLanguageProvider({ children, initialLanguage, initialDeviceLanguage, initialPreference }: { children: React.ReactNode; initialLanguage: InterfaceLanguage; initialDeviceLanguage: InterfaceLanguage; initialPreference: boolean }) {
  const router = useRouter();
  const [language, updateLanguage] = useState<InterfaceLanguage>(initialLanguage);
  const [deviceLanguage, setDeviceLanguage] = useState<InterfaceLanguage>(initialDeviceLanguage);
  const [hasPreference, setHasPreference] = useState(initialPreference);

  useEffect(() => {
    const detected = normalizeLanguage(navigator.languages?.[0] ?? navigator.language);
    const saved = localStorage.getItem(preferenceKey);
    setDeviceLanguage(detected);
    setHasPreference(Boolean(saved) || initialPreference);
    updateLanguage(saved ? normalizeLanguage(saved) : initialPreference ? initialLanguage : detected);
  }, [initialLanguage, initialPreference]);

  useEffect(() => { document.documentElement.lang = language === "pt" ? "pt-BR" : language; }, [language]);

  function setLanguage(next: InterfaceLanguage) {
    updateLanguage(next);
    setHasPreference(true);
    localStorage.setItem(preferenceKey, next);
    document.cookie = `pronto-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return <LanguageContext.Provider value={{ language, deviceLanguage, hasPreference, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useInterfaceLanguage() { return useContext(LanguageContext); }
