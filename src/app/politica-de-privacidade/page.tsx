import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Entenda como o Pronto! trata e protege os dados necessários ao atendimento da BIB/FAUFBA.",
  alternates: { canonical: "/politica-de-privacidade" },
};

const summary = [
  ["shield", "Só o necessário", "Dados indispensáveis para sua conta e para o atendimento."],
  ["document", "Trabalho completo fora daqui", "O PDF completo não é enviado ao Pronto!."],
  ["clock", "Nada Consta temporário", "O arquivo de conferência é removido em 60 dias."],
];

function SummaryIcon({ name }: { name: string }) {
  const paths = name === "shield" ? <path d="M12 3 5 6v5c0 4.6 3 7.7 7 10 4-2.3 7-5.4 7-10V6l-7-3Z" /> : name === "document" ? <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 12h5M10 16h5" /></> : <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths}</svg>;
}

export default function PrivacyNoticePage() {
  return <><SiteHeader /><main className="privacy-page">
    <header className="container privacy-hero">
      <p className="eyebrow">Política de privacidade · versão 1.0</p><h1>Privacidade, em linguagem clara.</h1>
      <p className="privacy-hero__lead">Aqui você encontra, sem juridiquês, como o Pronto! usa e protege as informações necessárias ao atendimento.</p>
    </header>
    <section className="container privacy-summary" aria-label="Resumo da política">{summary.map(([icon, title, description]) => <article className="privacy-summary__card" key={title}><span className="privacy-summary__icon"><SummaryIcon name={icon} /></span><h2>{title}</h2><p>{description}</p></article>)}</section>
    <section className="container privacy-accordion" aria-label="Detalhes da política de privacidade">
      <details open><summary><span>01</span><strong>Dados e finalidade</strong><b aria-hidden="true">+</b></summary><div><p>Podemos tratar nome, e-mail institucional, CPF, matrícula ou vínculo acadêmico, dados da solicitação, link público do trabalho e informações do atendimento. Senhas não são visíveis para a biblioteca.</p><p>Usamos esses dados para identificar a pessoa usuária, manter a conta segura, receber e atender a solicitação de ficha, orientar o autodepósito e registrar ações necessárias à continuidade do serviço.</p></div></details>
      <details><summary><span>02</span><strong>Responsáveis, base legal e contato</strong><b aria-hidden="true">+</b></summary><div><p><strong>Controladora:</strong> Universidade Federal da Bahia (UFBA), por meio da Biblioteca da Faculdade de Arquitetura.</p><p><strong>Canal do serviço:</strong> <a href="mailto:bibarq@ufba.br">bibarq@ufba.br</a>. <strong>Encarregada de Dados da UFBA:</strong> Ana Cláudia Caldas Mendonça Semêdo; canal institucional: <a href="mailto:ouvidoria@ufba.br">ouvidoria@ufba.br</a>.</p><p>O tratamento fundamenta-se no cumprimento de obrigação legal ou regulatória e atende à finalidade pública de prestar o serviço bibliotecário da UFBA.</p></div></details>
      <details><summary><span>03</span><strong>Seus direitos</strong><b aria-hidden="true">+</b></summary><div><p>Você pode confirmar o tratamento, acessar e corrigir seus dados; pedir anonimização, bloqueio ou eliminação quando cabível; conhecer compartilhamentos; pedir portabilidade quando aplicável; peticionar à ANPD e opor-se a tratamento irregular.</p><p>Alguns pedidos dependem da finalidade pública, das obrigações legais e das regras de conservação. A Ouvidoria orienta o atendimento.</p></div></details>
      <details><summary><span>04</span><strong>Acesso, compartilhamento e cookies</strong><b aria-hidden="true">+</b></summary><div><p>Você acessa seus próprios dados. A equipe autorizada vê apenas o necessário para atender a solicitação. A coordenação, quando habilitada, recebe visão limitada, sem CPF, documentos ou comentários internos.</p><p>Supabase (autenticação, banco e armazenamento) e Vercel (hospedagem) atuam como operadores técnicos. O Pronto! não vende dados nem os utiliza para marketing.</p><p>Cookies essenciais mantêm a sessão. O navegador pode guardar preferência de tema e rascunho local. Não usamos cookies de publicidade ou ferramentas próprias de análise de navegação.</p></div></details>
      <details><summary><span>05</span><strong>Proteção e prazos de guarda</strong><b aria-hidden="true">+</b></summary><div><p>Usamos conexão protegida, autenticação, controle por perfil e registros de ações para reduzir riscos. Conta, CPF, e-mail e o atendimento acadêmico são mantidos enquanto houver vínculo e, no total, por 100 anos, como assentamento individual do aluno. Solicitação, metadados, ficha, pendências e homologação seguem o mesmo prazo.</p><p>O Nada Consta no Pronto! é apenas arquivo de conferência e é removido 60 dias após o encerramento; o registro de longo prazo permanece no Pergamum. Auditorias administrativas e operacionais: 5 anos; logs técnicos: 6 meses; incidentes: 5 anos após apuração; backups: 90 dias, salvo preservação necessária.</p></div></details>
    </section>
  </main></>;
}
