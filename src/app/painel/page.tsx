import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("full_name, role").eq("id", user.id).single() : { data: null };
  if (profile?.role === "cataloger" || profile?.role === "administrator") redirect("/painel/fila");
  const { data: activeRequest } = await supabase.from("cataloging_requests").select("protocol, status, title").in("status", ["submitted", "in_review", "changes_requested", "approved"]).maybeSingle();
  const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const { data: calendarDates } = await supabase.from("library_announcements").select("id,type,title,starts_at").eq("active", true).in("type", ["holiday", "optional_day"]).gte("starts_at", monthStart.toISOString()).lt("starts_at", nextMonth.toISOString()).order("starts_at");
  return (
    <main className="dashboard-main">
      <div className="page-heading">
        <div><p className="eyebrow">Visão geral</p><h1>Seu acompanhamento</h1></div>
        <span className="sla-card"><strong>3</strong> dias úteis<br />prazo médio atual</span>
      </div>

      <section className="dashboard-grid">
        <article className="next-action">
          <span className="next-action__index">01</span>
          <div>
            <p className="eyebrow">Sua próxima ação</p>
            <h2>{activeRequest ? activeRequest.protocol : "Inicie sua solicitação"}</h2>
            <p>{activeRequest ? `Seu trabalho “${activeRequest.title}” foi registrado e já pode ser acompanhado.` : "Tenha em mãos a matrícula atual, a versão final já aprovada e um link público para o trabalho completo."}</p>
            <Link className="button button--primary" href={activeRequest ? "/painel/solicitacao" : "/painel/solicitacao/nova"}>{activeRequest ? "Acompanhar protocolo" : "Iniciar solicitação"}</Link>
          </div>
        </article>
        <aside className="dashboard-side">
          <section className="panel">
            <p className="eyebrow">Antes de solicitar</p>
            <ul className="check-list">
              <li>Trabalho defendido e aprovado</li>
              <li>Versão final concluída</li>
              <li>Folha de aprovação, quando aplicável</li>
              <li>Link público de visualização</li>
            </ul>
          </section>
          <section className="panel panel--institutional calendar-panel">
            <strong>Avisos e prazos</strong>
            <p>Atendimento normal. Acompanhe por aqui os avisos e as datas informadas pela biblioteca.</p>
            {calendarDates?.length ? <ul>{calendarDates.map((item) => <li key={item.id}><time>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(item.starts_at))}</time><span>{item.title} <small>{item.type === "holiday" ? "Feriado" : "Ponto facultativo"}</small></span></li>)}</ul> : <p className="calendar-panel__empty">Não há feriados ou pontos facultativos cadastrados para este mês.</p>}
          </section>
        </aside>
      </section>

      {!activeRequest && <section className="history-empty">
        <div><p className="eyebrow">Histórico</p><h2>Nenhuma solicitação anterior</h2></div>
        <p>Quando um protocolo for concluído, ele continuará disponível aqui para consulta.</p>
      </section>}
    </main>
  );
}
