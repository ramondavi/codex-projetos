"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/app-icon";
import { RequestPriorityControl } from "@/components/request-priority-control";
import { RequestTimelineDialog, type TimelineEvent } from "@/components/request-timeline";
import { createClient } from "@/lib/supabase/client";

type StaffOption = { id: string; fullName: string };

export function ProtocolActionsMenu({ requestId, timelineEvents, priorityReasonCode = null, priorityReasonDetail = null, canSetPriority = true, canRevisit = false, canRelease = false, canReassign = false, staff = [], assignedTo = null }: {
  requestId: string;
  timelineEvents?: TimelineEvent[];
  priorityReasonCode?: string | null;
  priorityReasonDetail?: string | null;
  canSetPriority?: boolean;
  canRevisit?: boolean;
  canRelease?: boolean;
  canReassign?: boolean;
  staff?: StaffOption[];
  assignedTo?: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function release() {
    setBusy(true); setError("");
    const { error: rpcError } = await createClient().rpc("release_cataloging_request", { target_request_id: requestId });
    setBusy(false);
    if (rpcError) { setError("Não foi possível liberar o atendimento."); return; }
    router.push("/painel/fila"); router.refresh();
  }
  async function reassign(targetStaffId: string) {
    if (!targetStaffId) return;
    setBusy(true); setError("");
    const { error: rpcError } = await createClient().rpc("reassign_cataloging_request", { target_request_id: requestId, target_staff_id: targetStaffId });
    setBusy(false);
    if (rpcError) { setError(assignedTo ? "Não foi possível reatribuir o atendimento." : "Não foi possível atribuir o atendimento."); return; }
    router.push("/painel/fila"); router.refresh();
  }
  return <details className="protocol-actions-menu"><summary aria-label="Ações gerais do protocolo" title="Ações gerais do protocolo"><AppIcon name="settings" /></summary><div className="protocol-actions-menu__panel" role="group" aria-label="Ações gerais do protocolo"><RequestTimelineDialog events={timelineEvents} requestId={timelineEvents ? undefined : requestId} menuItem />{canSetPriority && <RequestPriorityControl requestId={requestId} initialReasonCode={priorityReasonCode} initialReasonDetail={priorityReasonDetail} menuItem />}{canRevisit && <Link className="protocol-actions-menu__item protocol-actions-menu__revisit" href={`/painel/atendimento/${requestId}?rever=1`} onClick={() => window.dispatchEvent(new Event("request-analysis:revisit"))}><AppIcon name="review" />Rever declarações</Link>}{canRelease && <button className="protocol-actions-menu__item" type="button" disabled={busy} onClick={release}><AppIcon name="queue" />Liberar atendimento para a fila</button>}{canReassign && <label className="protocol-actions-menu__reassign"><span><AppIcon name="person" />{assignedTo ? "Reatribuir para outro bibliotecário" : "Atribuir a um bibliotecário"}</span><select defaultValue="" disabled={busy} onChange={(event) => reassign(event.target.value)}><option value="">Escolha um bibliotecário</option>{staff.filter((person) => person.id !== assignedTo).map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}</select></label>}{error && <p className="form-error" role="alert">{error}</p>}</div></details>;
}
