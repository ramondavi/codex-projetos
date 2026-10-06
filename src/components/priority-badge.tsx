import { AppIcon } from "@/components/app-icon";

export function hasPriority(value: unknown): boolean {
  return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;
}

export function PriorityBadge({ reason, label = "Prioritário" }: { reason?: string | null; label?: string }) {
  return <span className="priority-badge" title={reason ? `Prioritário: ${reason}` : "Solicitação prioritária"}><AppIcon name="star" /> {label}</span>;
}
