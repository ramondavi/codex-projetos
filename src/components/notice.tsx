type Announcement = { title: string; message: string; type: string };

export function Notice({ announcement }: { announcement?: Announcement | null }) {
  return (
    <aside className={`notice${announcement ? " notice--alert" : ""}`} aria-label="Situação do atendimento">
      <span className="notice__status"><span className="notice__live-dot" aria-hidden="true" />{announcement?.title ?? "Atendimento normal"}</span>
      <p>{announcement?.message ?? <><strong>Prazo médio atual:</strong> 3 dias úteis</>}</p>
    </aside>
  );
}
