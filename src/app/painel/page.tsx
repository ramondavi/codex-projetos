import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminProvisioningAlert } from "@/components/admin-provisioning-alert";
import { StudentRequestShortcut } from "@/components/student-request-shortcut";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("full_name, role").eq("id", user.id).single() : { data: null };
  if (!profile || !user) redirect("/entrar");
  if (profile.role === "cataloger" || profile.role === "administrator") return <StaffOverview role={profile.role} userId={user.id} />;
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
          <div className="next-action__content">
            <p className="eyebrow">Sua próxima ação</p>
            <h2>{activeRequest ? activeRequest.protocol : "Inicie sua solicitação"}</h2>
            <p>{activeRequest ? `Seu trabalho “${activeRequest.title}” foi registrado e já pode ser acompanhado.` : "Tenha em mãos a matrícula atual, a versão final já aprovada e um link público para o trabalho completo."}</p>
            {activeRequest ? <Link className="button button--primary" href="/painel/solicitacao">Acompanhar protocolo</Link> : <StudentRequestShortcut className="button button--primary" />}
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

async function StaffOverview({ role, userId }: { role: "cataloger" | "administrator"; userId: string }) {
  const supabase = await createClient();
  const [{ data: requests }, { data: announcements }, { data: candidates }, { count: activeStaffCount }] = await Promise.all([
    supabase.from("cataloging_requests").select("status,assigned_to"),
    supabase.from("library_announcements").select("id,title,message,type,starts_at").eq("active", true).order("starts_at", { ascending: false }).limit(3),
    role === "administrator" ? supabase.rpc("list_confirmed_staff_candidates") : Promise.resolve({ data: [] as { user_id: string; email: string }[] }),
    role === "administrator" ? supabase.from("profiles").select("id", { count: "exact", head: true }).in("role", ["cataloger", "administrator"]).eq("status", "active") : Promise.resolve({ count: null }),
  ]);
  const all = requests ?? [];
  const unassigned = all.filter((request) => !request.assigned_to).length;
  const mine = all.filter((request) => request.assigned_to === userId && ["in_review", "changes_requested"].includes(request.status)).length;
  const changes = all.filter((request) => request.status === "changes_requested").length;
  const approved = all.filter((request) => request.status === "approved").length;
  const administrator = role === "administrator";
  const announcementLabels: Record<string, string> = { normal: "Aviso", recess: "Recesso", strike: "Paralisação/greve", other: "Ocorrência", holiday: "Feriado", optional_day: "Ponto facultativo" };
  return <main className="dashboard-main dashboard-main--staff-overview">
    <div className="page-heading"><div><p className="eyebrow">Visão geral</p><h1>{administrator ? "Operação administrativa" : "Atendimento bibliotecário"}</h1><p>{administrator ? "Acompanhe acessos, fila e informações operacionais em um só lugar." : "Acompanhe sua carga de atendimento e o que precisa de ação agora."}</p></div></div>
    <section className="overview-stats" aria-label="Indicadores rápidos">
      <article><strong>{unassigned}</strong><span>na fila sem responsável</span><Link href="/painel/fila">Abrir fila</Link></article>
      <article><strong>{mine}</strong><span>{administrator ? "atendimentos em andamento" : "meus atendimentos em andamento"}</span><Link href="/painel/fila?responsavel=me">Ver atendimentos</Link></article>
      <article><strong>{changes}</strong><span>solicitações aguardando correção</span><Link href="/painel/fila?status=changes_requested">Ver pendências</Link></article>
      <article><strong>{administrator ? candidates.length : approved}</strong><span>{administrator ? "contas aguardando provisionamento" : "solicitações aprovadas"}</span><Link href={administrator ? "/painel/admin" : "/painel/fila?status=approved"}>{administrator ? "Administrar contas" : "Ver aprovações"}</Link></article>
    </section>
    {administrator && <section className="overview-context"><article className="panel"><p className="eyebrow">Equipe ativa</p><h2>{activeStaffCount ?? 0} pessoas com acesso operacional</h2><p>Use a administração para ajustar perfis, situações e permissões.</p><Link className="button button--secondary button--small" href="/painel/admin">Abrir administração</Link></article><article className="panel"><p className="eyebrow">Prioridade da fila</p><h2>{unassigned ? `${unassigned} solicitações aguardam responsável` : "Fila distribuída"}</h2><p>{unassigned ? "Reveja a fila para distribuir ou assumir os atendimentos disponíveis." : "No momento, não há solicitações sem responsável."}</p><Link className="button button--secondary button--small" href="/painel/fila">Gerenciar fila</Link></article></section>}
    {administrator && <AdminProvisioningAlert candidates={candidates ?? []} />}
    <section className="overview-announcements"><div><p className="eyebrow">Informes</p><h2>Avisos da biblioteca</h2></div>{announcements?.length ? <div className="overview-announcements__list">{announcements.map((item) => <article className="panel" key={item.id}><span>{announcementLabels[item.type] ?? "Aviso"}</span><strong>{item.title}</strong><time>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(item.starts_at))}</time><p>{item.message}</p></article>)}</div> : <p className="history-empty">Não há informes ativos no momento.</p>}</section>
  </main>;
}
