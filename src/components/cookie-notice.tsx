"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useInterfaceLanguage } from "./interface-language";

const copy = {
  pt: ["Cookies essenciais", "O Pronto! usa apenas cookies essenciais para manter sua sessão. As preferências da interface ficam salvas neste navegador. Não usamos cookies de publicidade.", "Leia a Política de privacidade", "Aceitar e continuar"],
  en: ["Essential cookies", "Pronto! uses only essential cookies to maintain your session. Interface preferences are saved in this browser. We do not use advertising cookies.", "Read the Privacy policy", "Accept and continue"],
  es: ["Cookies esenciales", "Pronto! solo usa cookies esenciales para mantener su sesión. Las preferencias de la interfaz se guardan en este navegador. No usamos cookies publicitarias.", "Leer la Política de privacidad", "Aceptar y continuar"],
  de: ["Notwendige Cookies", "Pronto! verwendet nur notwendige Cookies für Ihre Sitzung. Oberflächeneinstellungen werden in diesem Browser gespeichert. Wir verwenden keine Werbe-Cookies.", "Datenschutzerklärung lesen", "Akzeptieren und fortfahren"],
  fr: ["Cookies essentiels", "Pronto! utilise uniquement des cookies essentiels pour maintenir votre session. Les préférences d’interface sont enregistrées dans ce navigateur. Aucun cookie publicitaire n’est utilisé.", "Lire la Politique de confidentialité", "Accepter et continuer"],
  it: ["Cookie essenziali", "Pronto! usa solo cookie essenziali per mantenere la sessione. Le preferenze dell’interfaccia vengono salvate in questo browser. Non usiamo cookie pubblicitari.", "Leggi l’Informativa sulla privacy", "Accetta e continua"],
};

const storageKey = "pronto-essential-cookies-v1";

export function CookieNotice() {
  const dialog = useRef<HTMLDialogElement>(null);
  const { language } = useInterfaceLanguage();
  const t = copy[language];

  useEffect(() => {
    if (localStorage.getItem(storageKey) !== "accepted") dialog.current?.showModal();
  }, []);

  const accept = () => {
    localStorage.setItem(storageKey, "accepted");
    dialog.current?.close();
  };

  return <dialog ref={dialog} className="cookie-notice" aria-labelledby="cookie-notice-title" aria-describedby="cookie-notice-description">
    <h2 id="cookie-notice-title">{t[0]}</h2>
    <p id="cookie-notice-description">{t[1]}</p>
    <div className="cookie-notice__actions"><Link href="/politica-de-privacidade" onClick={() => dialog.current?.close()}>{t[2]}</Link><button type="button" className="button button--primary" onClick={accept}>{t[3]}</button></div>
  </dialog>;
}
