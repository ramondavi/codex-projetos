export function hasPriority(value: unknown): boolean {
  return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;
}

export function PriorityBadge({ reason }: { reason?: string | null }) {
  return <span className="priority-badge" title={reason ? `Prioritário: ${reason}` : "Solicitação prioritária"}><span aria-hidden="true">★</span> Prioritário</span>;
}
