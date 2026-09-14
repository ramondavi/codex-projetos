"use client";

export function FinalDecisionDialog({ title, description, confirmLabel, confirmDanger = false, busy = false, onCancel, onConfirm }: { title: string; description: string; confirmLabel: string; confirmDanger?: boolean; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div className="final-decision-dialog" role="alertdialog" aria-modal="true" aria-labelledby="final-decision-dialog-title"><div className="final-decision-dialog__card"><p className="eyebrow">Confirmação necessária</p><h2 id="final-decision-dialog-title">{title}</h2><p>{description}</p><div><button className="button button--secondary" type="button" disabled={busy} onClick={onCancel}>Continuar revisando</button><button className={`button ${confirmDanger ? "button--danger" : "button--primary"}`} type="button" disabled={busy} onClick={onConfirm}>{busy ? "Confirmando…" : confirmLabel}</button></div></div></div>;
}
