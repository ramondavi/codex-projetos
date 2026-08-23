"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type RepositoryCopyField = { label: string; value?: string | null; note?: string };

export function RepositoryDepositGuide({ requestId, startedAt, fields }: { requestId: string; startedAt: string | null; fields: RepositoryCopyField[] }) {
  const [started, setStarted] = useState(startedAt);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  async function begin() {
    setBusy(true); setError("");
    const { data, error: rpcError } = await createClient().rpc("start_repository_deposit", { target_request_id: requestId });
    if (rpcError) setError("Não foi possível registrar o início. Atualize a página e tente novamente.");
    else setStarted(String(data));
    setBusy(false);
  }
  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value); setCopied(label); window.setTimeout(() => setCopied(""), 1600);
  }
  if (!started) return <section className="repository-start panel"><p className="eyebrow">Etapa liberada</p><h2>Inicie quando estiver diante do RI/UFBA</h2><p>O Pronto! registra somente que você começou. O trabalho continua no seu computador e será enviado diretamente ao Repositório Institucional.</p><button className="button button--primary" disabled={busy} onClick={begin}>{busy ? "Registrando…" : "Iniciar autodepósito assistido"}</button>{error && <p className="auth-feedback" role="alert">{error}</p>}</section>;
  const steps = [
    ["01", "Coleção", "No RI/UFBA, clique em “Iniciar um novo depósito” e escolha exatamente a coleção indicada abaixo."],
    ["02", "Tipo de documento", "Selecione o tipo observado para seu curso ou programa."],
    ["03", "Metadados", "Use os botões para reduzir a redigitação. Confira cada valor no RI antes de avançar."],
    ["04", "Campos preenchidos diretamente no RI", "Informe data da defesa, acesso e eventual embargo, área CNPq, resumo/abstract, referências, DOI, ORCID/Lattes e banca conforme o trabalho. A área CNPq é escolhida na janela “Categorias de assuntos” do próprio RI."],
    ["05", "Upload no RI", "Selecione no RI o PDF final que você já baixou do Pronto!. Use nome claro, sem vírgula, confira formato, tamanho, arquivo primário e configurações de acesso. Nenhum arquivo é enviado ao Pronto! nesta etapa."],
    ["06", "Verificação", "Revise todos os blocos. Use “Correção de um campo” quando necessário e confirme o arquivo carregado."],
    ["07", "Licença", "Escolha você mesmo entre as opções exibidas no RI e leia a licença de distribuição não exclusiva. O Pronto! não escolhe licença, acesso nem embargo."],
    ["08", "Conclusão", "Concedendo a licença de distribuição, o depósito segue ao fluxo de validação do RI/UFBA. Acompanhe o e-mail e o “Meu espaço”."],
  ];
  return <>
    <section className="repository-progress"><strong>Autodepósito iniciado</strong><span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date(started))}</span></section>
    <section className="repository-map panel"><p className="eyebrow">Dados disponíveis para copiar</p><h2>Mapa Pronto! → RI/UFBA</h2><div>{fields.map((field) => <article key={field.label}><div><span>{field.label}</span>{field.value ? <strong>{field.value}</strong> : <em>{field.note ?? "Preencha diretamente no RI/UFBA."}</em>}</div>{field.value && <button className="button button--secondary button--small" onClick={() => copy(field.label, field.value!)}>{copied === field.label ? "Copiado" : "Copiar"}</button>}</article>)}</div></section>
    <section className="repository-steps">{steps.map(([index,title,body]) => <article className="panel" key={index}><span>{index}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</section>
    <section className="pdfa-guidance"><strong>PDF/A é uma orientação de preservação</strong><p>Consulte o tutorial oficial de conversão antes do upload. O Pronto! não converte nem valida automaticamente PDF/A.</p></section>
    <a className="button button--primary repository-ri-link" href="https://repositorio.ufba.br/submit" target="_blank" rel="noreferrer">Abrir o RI/UFBA em nova aba ↗</a>
  </>;
}
