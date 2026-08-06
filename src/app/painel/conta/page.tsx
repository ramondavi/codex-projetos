export default function AccountPage() {
  return (
    <main className="dashboard-main dashboard-main--narrow">
      <div className="page-heading"><div><p className="eyebrow">Minha conta</p><h1>Dados pessoais</h1></div></div>
      <section className="panel account-panel">
        <div><span>Nome</span><strong>Estudante de exemplo</strong></div>
        <div><span>CPF</span><strong>***.456.789-**</strong></div>
        <div><span>E-mail</span><strong>estudante@exemplo.com</strong></div>
        <p>A matrícula será informada em cada nova solicitação, pois ela pode mudar em um novo vínculo acadêmico.</p>
      </section>
    </main>
  );
}
