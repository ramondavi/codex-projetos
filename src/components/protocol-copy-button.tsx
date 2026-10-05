"use client";

import { useState } from "react";

export function ProtocolCopyButton({ protocol, showLabel = true }: { protocol: string; showLabel?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(protocol);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }
  return <button className={`protocol-copy-button${copied ? " is-copied" : ""}`} type="button" onClick={copy} title="Copiar número do protocolo" aria-label={copied ? "Protocolo copiado" : `Copiar protocolo ${protocol}`}>{copied ? "Protocolo copiado" : showLabel ? `Protocolo ${protocol}` : protocol}</button>;
}
