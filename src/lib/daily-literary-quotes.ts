export type LiteraryQuote = { text: string; author: string; work: string; source: string; year: number };

// Seleção de trechos curtos em português moderno, com fonte identificada.
export const DAILY_LITERARY_QUOTES: readonly LiteraryQuote[] = [
  { text: "De que cor eram os olhos de minha mãe?", author: "Conceição Evaristo", work: "Olhos d’água", year: 2014, source: "https://www.letras.ufmg.br/literafro/24-textos-das-autoras/929-conceicaoevaristo-olhos-d-agua" },
  { text: "Abri a mala sozinha, sob nossos olhos luminosos.", author: "Itamar Vieira Junior", work: "Torto Arado", year: 2019, source: "https://todavialivros.com.br/livros/torto-arado" },
  { text: "Somos mesmo uma humanidade?", author: "Ailton Krenak", work: "Ideias para adiar o fim do mundo", year: 2019, source: "https://www.companhiadasletras.com.br/trechos/14722.pdf" },
  { text: "A fome também é professora.", author: "Carolina Maria de Jesus", work: "Quarto de Despejo", year: 1960, source: "https://sites.unipampa.edu.br/lehl/2018/10/21/uma-analise-sobre-a-obra-quarto-de-despejo-de-carolina-maria-de-jesus-por-rafael-barbosa/" },
  { text: "Tudo no mundo começou com um sim.", author: "Clarice Lispector", work: "A Hora da Estrela", year: 1977, source: "https://prefeitura.sp.gov.br/web/cultura/w/bibliotecas/noticias/25259" },
  { text: "Viver é muito perigoso.", author: "João Guimarães Rosa", work: "Grande Sertão: Veredas", year: 1956, source: "https://acervodigital.secult.mg.gov.br/museu-casa-guimaraes-rosa-mcgr/185141-2/" },
  { text: "Não sei, só sei que foi assim.", author: "Ariano Suassuna", work: "Auto da Compadecida", year: 1955, source: "https://goias.gov.br/educacao/wp-content/uploads/sites/40/2024/10/REVISA-GOIAS-9o-ANO-LP-E-MAT_OUTUBRO-E-NOVEMBRO_ESTUDANTE.pdf" },
  { text: "É preciso conhecer a fome para saber descrevê-la.", author: "Carolina Maria de Jesus", work: "Quarto de Despejo", year: 1960, source: "https://sites.unipampa.edu.br/lehl/2018/10/21/uma-analise-sobre-a-obra-quarto-de-despejo-de-carolina-maria-de-jesus-por-rafael-barbosa/" },
  { text: "Uma molécula disse sim a outra molécula e nasceu a vida.", author: "Clarice Lispector", work: "A Hora da Estrela", year: 1977, source: "https://prefeitura.sp.gov.br/web/cultura/w/bibliotecas/noticias/25259" },
  { text: "O sertão é do tamanho do mundo.", author: "João Guimarães Rosa", work: "Grande Sertão: Veredas", year: 1956, source: "https://curriculo.sedu.es.gov.br/curriculo/wp-content/uploads/2024/05/lp3serie16semana1721jun24290524.pdf" },
];

export function quoteForDay(now: Date) {
  const dateParts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => Number(dateParts.find((item) => item.type === type)?.value);
  const dayNumber = Math.floor(Date.UTC(part("year"), part("month") - 1, part("day")) / 86_400_000);
  return DAILY_LITERARY_QUOTES[dayNumber % DAILY_LITERARY_QUOTES.length]!;
}
