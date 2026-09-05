"use client";

import { useState } from "react";

export function ProtocolCopyButton({ protocol }: { protocol: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(protocol);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }
  return <button className="protocol-copy-button" type="button" onClick={copy} title="Copiar número do protocolo">{copied ? "Protocolo copiado" : `Protocolo ${protocol}`}</button>;
}
