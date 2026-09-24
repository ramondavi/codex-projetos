type Announcement = { title: string; message: string; type: string };

export function Notice({ announcement, copy = { label: "Situação do atendimento", normal: "Atendimento normal", average: "Prazo médio atual:", days: "3 dias úteis" } }: { announcement?: Announcement | null; copy?: { label: string; normal: string; average: string; days: string } }) {
  return (
    <aside className={`notice${announcement ? " notice--alert" : ""}`} aria-label={copy.label}>
      <span className="notice__status"><span className="notice__live-dot" aria-hidden="true" />{announcement?.title ?? copy.normal}</span>
      <p>{announcement?.message ?? <><strong>{copy.average}</strong> {copy.days}</>}</p>
    </aside>
  );
}
