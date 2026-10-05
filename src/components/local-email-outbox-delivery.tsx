"use client";

import { useEffect } from "react";
import { processLocalEmailOutbox } from "@/app/painel/fila/email-actions";

export function LocalEmailOutboxDelivery() {
  useEffect(() => {
    let active = true;
    let running = false;
    async function deliver() {
      if (!active || running) return;
      running = true;
      try { await processLocalEmailOutbox(); } catch { /* A fila conserva mensagens não entregues para nova tentativa. */ }
      finally { running = false; }
    }
    void deliver();
    const timer = window.setInterval(() => { void deliver(); }, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  return null;
}
