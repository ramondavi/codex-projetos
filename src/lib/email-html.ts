import sanitizeHtml from "sanitize-html";

const colors = {
  background: "#f3f3f1",
  surface: "#ffffff",
  text: "#0a0a0a",
  muted: "#626262",
  border: "#cfcfcf",
  institutional: "#1a3b70",
  institutionalSoft: "#edf3fa",
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
const importantPattern = /(\b[A-Z]{2,}\d{4}-\d{4,}\b|\b\d+\s+dias?\s+úteis\b|Atenção!|ficha catalográfica foi homologada|ficha já está disponível no Pronto!|informações que precisam ser corrigidas|protocolo foi encerrado|Administração → Equipe e acessos)/gi;
const importantTest = /^(?:[A-Z]{2,}\d{4}-\d{4,}|\d+\s+dias?\s+úteis|Atenção!|ficha catalográfica foi homologada|ficha já está disponível no Pronto!|informações que precisam ser corrigidas|protocolo foi encerrado|Administração → Equipe e acessos)$/i;
const detailLine = /^(Trabalho|Solicitante|Matrícula|Protocolo|Prazo de referência|Previsão da análise|Publicação no RI\/UFBA|Endereço permanente da publicação):\s*(.*)$/i;
const adjustmentLine = /^•\s+([^:]+):\s*(.*)$/;

function importantText(value: string) {
  return value.split(importantPattern).map((part) => importantTest.test(part) ? `<strong style="color:${colors.text};font-weight:700">${escapeHtml(part)}</strong>` : escapeHtml(part)).join("");
}

function linkedText(value: string) {
  return value.split(/(https?:\/\/[^\s<>]+)/g).map((part) => {
    if (!/^https?:\/\//.test(part)) return importantText(part);
    const url = part.replace(/[.,;:!?]+$/, "");
    const trailing = part.slice(url.length);
    return `<a href="${escapeHtml(url)}" style="color:${colors.institutional};font-weight:700;text-decoration:underline;word-break:break-word">${escapeHtml(url)}</a>${escapeHtml(trailing)}`;
  }).join("");
}

function paragraphHtml(value: string) {
  const lines = value.split("\n");
  const adjustments = lines.map((line) => line.match(adjustmentLine));
  if (adjustments.every(Boolean)) {
    const rows = adjustments.map((match) => `<tr><td style="padding:10px 10px 10px 0;color:${colors.institutional};font-size:16px;vertical-align:top">•</td><td style="padding:10px 0;color:${colors.text};font-size:14px;line-height:1.55;vertical-align:top"><strong style="font-weight:700">${escapeHtml(match![1])}:</strong> ${linkedText(match![2])}</td></tr>`).join("");
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;padding:8px 16px;border-left:3px solid ${colors.institutional};border-radius:6px;background:${colors.institutionalSoft}">${rows}</table>`;
  }
  const details = lines.map((line) => line.match(detailLine));
  if (details.every(Boolean)) {
    const rows = details.map((match) => `<tr><td style="padding:7px 10px 7px 0;color:${colors.muted};font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(match![1])}</td><td style="padding:7px 0;color:${colors.text};font-size:14px;font-weight:700;vertical-align:top">${linkedText(match![2])}</td></tr>`).join("");
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;padding:10px 14px;border-left:3px solid ${colors.institutional};border-radius:6px;background:${colors.institutionalSoft}">${rows}</table>`;
  }
  return `<p style="margin:0 0 18px;color:${colors.text};font-size:15px;line-height:1.65">${lines.map(linkedText).join("<br>")}</p>`;
}

const correctionSubject = /^Pronto!\s*\|\s*Correções necessárias\b/i;
const studentReplySubject = /^Pronto!\s*\|\s*Resposta sobre o protocolo\b/i;
const richReplyPattern = /<\/?(?:p|strong|em|ul|ol|li|a|br)\b/i;
function replyParagraphs(body: string, html: boolean) {
  const parts = body.split(/\n\s*\n/).filter(Boolean);
  if (parts.length < 4 || !richReplyPattern.test(parts[2])) return null;
  const reply = parts.slice(2, -1).join("\n\n");
  if (!html) {
    const plain = sanitizeHtml(reply.replace(/<\/(?:p|li|ul|ol)>|<br\s*\/?\s*>/gi, "\n"), { allowedTags: [], allowedAttributes: {} }).trim();
    return [...parts.slice(0, 2), plain, parts.at(-1)!].join("\n\n");
  }
  const safeReply = sanitizeHtml(reply, {
    allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li", "a"],
    allowedAttributes: { a: ["href", "style"] },
    allowedSchemes: ["https"],
    transformTags: { a: (_tag, attrs) => ({ tagName: "a", attribs: { href: attrs.href ?? "", style: `color:${colors.institutional};font-weight:700;text-decoration:underline` } }) },
  });
  return `${parts.slice(0, 2).map(paragraphHtml).join("")}<div style="margin:0 0 18px;color:${colors.text};font-size:15px;line-height:1.65">${safeReply}</div>${paragraphHtml(parts.at(-1)!)}`;
}
const coordinationCompletion = (subject: string, body: string) => /protocolo\s+n\.º\s+.*\s+concluído/i.test(subject) && body.includes("A página de acompanhamento desta solicitação foi fechada");
const explicitClosedLink = (body: string) => body.includes("O Magic Link enviado anteriormente não é mais válido.") ? body : body.replace("A página de acompanhamento desta solicitação foi fechada juntamente com o protocolo de atendimento.", "A página de acompanhamento desta solicitação foi fechada juntamente com o protocolo de atendimento. O Magic Link enviado anteriormente não é mais válido.");
const firstNameGreeting = (body: string) => body.replace(/^(Olá,\s+)([^\n.]+)(\.)/m, (_match, greeting: string, name: string, punctuation: string) => `${greeting}${name.trim().split(/\s+/)[0]}${punctuation}`);
const panelUrl = (siteUrl: string) => new URL("/painel", siteUrl).toString();
const resolveSiteUrl = (body: string, siteUrl: string) => body.replaceAll("{{SITE_URL}}", siteUrl.replace(/\/$/, ""));

function emailDestination(subject: string, textBody: string, siteUrl: string) {
  if (studentReplySubject.test(subject)) return undefined;
  if (correctionSubject.test(subject)) return new URL("/painel/solicitacao/corrigir", siteUrl).toString();
  return textBody.match(/https?:\/\/[^\s<>]+/)?.[0]?.replace(/[.,;:!?]+$/, "");
}

export function transactionalEmailText(subject: string, textBody: string, siteUrl: string) {
  const resolvedBody = firstNameGreeting(resolveSiteUrl(textBody, siteUrl)).trim();
  const body = studentReplySubject.test(subject) ? replyParagraphs(resolvedBody, false) ?? resolvedBody : coordinationCompletion(subject, resolvedBody) ? explicitClosedLink(resolvedBody) : resolvedBody;
  const correctionLink = correctionSubject.test(subject) ? `\n\nAcesse diretamente a tela de correção: ${emailDestination(subject, body, siteUrl)}` : "";
  const destination = emailDestination(subject, body, siteUrl);
  if (destination?.includes("/coordenacao/") || coordinationCompletion(subject, body)) return body;
  return `${body}${correctionLink}\n\nAcesse o painel do Pronto!: ${panelUrl(siteUrl)}`;
}

export function transactionalEmailHtml(subject: string, textBody: string, siteUrl: string) {
  const resolvedBody = firstNameGreeting(resolveSiteUrl(textBody, siteUrl)).trim();
  const body = coordinationCompletion(subject, resolvedBody) ? explicitClosedLink(resolvedBody) : resolvedBody;
  const firstUrl = emailDestination(subject, body, siteUrl);
  const coordinationAccess = Boolean(firstUrl?.includes("/coordenacao/"));
  const displayBody = coordinationAccess && firstUrl ? body.replace(firstUrl, "").replace(/Para acompanhar o andamento, use o acesso seguro abaixo:\s*/, "Para acompanhar o andamento, use o botão abaixo.") : body;
  const paragraphs = studentReplySubject.test(subject) ? replyParagraphs(displayBody, true) ?? displayBody.split(/\n\s*\n/).filter(Boolean).map(paragraphHtml).join("") : displayBody.split(/\n\s*\n/).filter(Boolean).map(paragraphHtml).join("");
  const actionLabel = firstUrl ? correctionSubject.test(subject) ? "Corrigir campos pendentes" : /coordenacao/i.test(firstUrl) ? "Acompanhar solicitação" : /reposit[oó]rio|handle|ri\.ufba/i.test(firstUrl) ? "Consultar publicação" : "Acessar o Pronto!" : "";
  const callToAction = firstUrl && firstUrl !== panelUrl(siteUrl) && !coordinationAccess ? `<p style="margin:26px 0 0"><a href="${escapeHtml(firstUrl)}" style="display:inline-block;padding:14px 22px;border-radius:8px;background:${colors.text};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none">${actionLabel}</a></p>` : "";
  const panelAction = coordinationCompletion(subject, body) ? "" : coordinationAccess && firstUrl
    ? `<p style="margin:26px 0 0"><a href="${escapeHtml(firstUrl)}" style="display:inline-block;padding:14px 22px;border-radius:8px;background:${colors.institutional};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none">Acompanhar solicitação</a></p><p style="margin:12px 0 0;color:${colors.muted};font-size:12px;line-height:1.5">Se o botão não abrir, copie este endereço no navegador:<br><a href="${escapeHtml(firstUrl)}" style="color:${colors.institutional};font-size:12px;word-break:break-all">${escapeHtml(firstUrl)}</a></p>`
    : `<p style="margin:26px 0 0"><a href="${escapeHtml(panelUrl(siteUrl))}" style="display:inline-block;padding:14px 22px;border-radius:8px;background:${colors.institutional};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none">Acessar o painel do Pronto!</a></p>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:32px 12px;background:${colors.background};font-family:Inter,Arial,Helvetica,sans-serif;color:${colors.text}"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:auto;border:1px solid ${colors.border};border-radius:8px;background:${colors.surface}"><tr><td style="padding:24px 32px;border-bottom:3px solid ${colors.institutional}"><img src="cid:pronto-logo" width="175" alt="Pronto! Biblioteca FAUFBA" style="display:block;width:175px;max-width:100%;height:auto"></td></tr><tr><td style="padding:32px"><p style="margin:0 0 10px;color:${colors.institutional};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">BIB/FAUFBA · Pronto!</p><h1 style="margin:0 0 24px;color:${colors.text};font-size:24px;line-height:1.25">${escapeHtml(subject.replace(/^Pronto!\s*\|\s*/, ""))}</h1>${paragraphs}${callToAction}${panelAction}</td></tr><tr><td style="padding:20px 32px;border-top:1px solid ${colors.border};background:${colors.background};color:${colors.muted};font-size:12px;line-height:1.6">Não responda. Esta é uma mensagem automática do Pronto!, serviço da Biblioteca da Faculdade de Arquitetura da UFBA.</td></tr></table></body></html>`;
}
