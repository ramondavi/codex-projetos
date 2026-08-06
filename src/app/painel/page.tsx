import Link from "next/link";

export default function StudentDashboardPage() {
  return (
    <main className="dashboard-main">
      <div className="page-heading">
        <div><p className="eyebrow">Visão geral</p><h1>Olá, estudante.</h1></div>
        <span className="sla-card"><strong>3</strong> dias úteis<br />prazo médio atual</span>
      </div>

      <section className="dashboard-grid">
        <article className="next-action">
          <span className="next-action__index">01</span>
          <div>
            <p className="eyebrow">Sua próxima ação</p>
            <h2>Inicie sua solicitação</h2>
            <p>Tenha em mãos a matrícula atual, a versão final já aprovada e um link público para o trabalho completo.</p>
            <button className="button button--primary" disabled>Iniciar solicitação · em breve</button>
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
          <section className="panel panel--institutional">
            <strong>Biblioteca da Faculdade de Arquitetura</strong>
            <p>Atendimento normal. Acompanhe avisos e prazos sempre por este painel.</p>
          </section>
        </aside>
      </section>

      <section className="history-empty">
        <div><p className="eyebrow">Histórico</p><h2>Nenhuma solicitação anterior</h2></div>
        <p>Quando um protocolo for concluído, ele continuará disponível aqui para consulta.</p>
      </section>
    </main>
  );
}
