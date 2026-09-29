import { EXTRA_DAILY_LITERARY_QUOTES } from "./daily-literary-quotes.generated";
import { BALANCED_DAILY_LITERARY_QUOTES } from "./daily-literary-quotes-balanced";

// Trechos conferidos nas obras digitalizadas da Wikisource e do Projeto Gutenberg.
export type LiteraryQuote = { text: string; author: string; work: string; source: string; year: number };
// Ano da edição citada; nas coletâneas, refere-se ao volume digitalizado.
const PUBLICATION_YEAR_BY_SOURCE: Record<string, number> = {
  "https://www.gutenberg.org/ebooks/74854": 1860,
  "https://www.gutenberg.org/ebooks/61653": 1901,
  "https://www.gutenberg.org/ebooks/55752": 1899,
  "https://www.gutenberg.org/ebooks/54829": 1881,
  "https://www.gutenberg.org/ebooks/68541": 1888,
  "https://www.gutenberg.org/ebooks/67535": 1915,
  "https://www.gutenberg.org/ebooks/67594": 1908,
  "https://www.gutenberg.org/ebooks/69229": 1901,
  "https://www.gutenberg.org/ebooks/69239": 1917,
  "https://www.gutenberg.org/ebooks/69187": 1890,
};
export const DAILY_LITERARY_QUOTES: readonly LiteraryQuote[] = [
  { text: "A vida é combate,\nQue os fracos abate,\nQue os fortes, os bravos,\nSó pode exaltar.", author: "Gonçalves Dias", work: "Canção do Tamoio", year: 1851, source: "https://pt.wikisource.org/wiki/Can%C3%A7%C3%A3o_do_Tamoio" },
  { text: "Pois só quem ama pode ter ouvido\nCapaz de ouvir e de entender estrelas", author: "Olavo Bilac", work: "Via Láctea, XIII", year: 1888, source: "https://pt.wikisource.org/wiki/Via_L%C3%A1ctea#XIII" },
  { text: "Tu dirás que é a Morte; eu direi que é a Vida.", author: "Machado de Assis", work: "Uma Criatura", year: 1901, source: "https://pt.wikisource.org/wiki/Uma_Criatura" },
  { text: "Minha terra tem palmeiras,\nOnde canta o Sabiá;", author: "Gonçalves Dias", work: "Canção do Exílio", year: 1846, source: "https://pt.wikisource.org/wiki/Can%C3%A7%C3%A3o_do_Ex%C3%ADlio_%28Gon%C3%A7alves_Dias%29" },
  { text: "Ao vencedor, as batatas!", author: "Machado de Assis", work: "Quincas Borba, XVIII", year: 1891, source: "https://pt.wikisource.org/wiki/Quincas_Borba/XVIII" },
  ...EXTRA_DAILY_LITERARY_QUOTES.map((quote) => ({ ...quote, year: PUBLICATION_YEAR_BY_SOURCE[quote.source] })),
  { text: "De que cor eram os olhos de minha mãe?", author: "Conceição Evaristo", work: "Olhos d’água", year: 2014, source: "https://www.letras.ufmg.br/literafro/24-textos-das-autoras/929-conceicaoevaristo-olhos-d-agua" },
  { text: "Mas ninguém foge ao destino, a não ser que Ele queira, porque, quando Ele quer, até água fria é remédio.", author: "Ana Maria Gonçalves", work: "Um defeito de cor", year: 2006, source: "https://cdn.cebraspe.org.br/vestibulares/VEST_ESCS_15/arquivos/VESTESCS15_001_01.pdf" },
  { text: "Abri a mala sozinha, sob nossos olhos luminosos.", author: "Itamar Vieira Junior", work: "Torto Arado", year: 2019, source: "https://todavialivros.com.br/livros/torto-arado" },
  { text: "Ou a obediência estúpida, ou a revolta", author: "Milton Hatoum", work: "Cinzas do Norte", year: 2005, source: "https://www.companhiadasletras.com.br/trecho/9788535906851" },
  { text: "Uma simples palavra que se estende por rios, montes, vales infinitamente compridos como os braços de Deus.", author: "Lygia Fagundes Telles", work: "As Meninas", year: 1973, source: "https://www.companhiadasletras.com.br/trecho/9788535914306" },
  { text: "Somos mesmo uma humanidade?", author: "Ailton Krenak", work: "Ideias para adiar o fim do mundo", year: 2019, source: "https://www.companhiadasletras.com.br/trechos/14722.pdf" },
  { text: "A fome também é professora.", author: "Carolina Maria de Jesus", work: "Quarto de Despejo", year: 1960, source: "https://sites.unipampa.edu.br/lehl/2018/10/21/uma-analise-sobre-a-obra-quarto-de-despejo-de-carolina-maria-de-jesus-por-rafael-barbosa/" },
  { text: "Tudo no mundo começou com um sim.", author: "Clarice Lispector", work: "A Hora da Estrela", year: 1977, source: "https://prefeitura.sp.gov.br/web/cultura/w/bibliotecas/noticias/25259" },
  { text: "O mar em troca acende as ardentias,\n— Constelações do líquido tesouro...", author: "Castro Alves", work: "O Navio Negreiro", year: 1869, source: "https://pt.wikisource.org/wiki/Navio_negreiro" },
  { text: "Liberdade, essa palavra que o sonho humano alimenta, que não há ninguém que explique e ninguém que não entenda...", author: "Cecília Meireles", work: "Romanceiro da Inconfidência", year: 1953, source: "https://multi.rio/index.php/noticias/3017-cecilia-meireles-poeta" },
  { text: "Viver é muito perigoso.", author: "João Guimarães Rosa", work: "Grande Sertão: Veredas", year: 1956, source: "https://acervodigital.secult.mg.gov.br/museu-casa-guimaraes-rosa-mcgr/185141-2/" },
  { text: "Ele ficou sozinho e empregou anos em conhecer a cidade.", author: "Jorge Amado", work: "Capitães da Areia", year: 1937, source: "https://curriculo.sedu.es.gov.br/curriculo/wp-content/uploads/2025/06/9o_LP_RPE_Quinzena-12_LIVRETO.pdf" },
  { text: "E a imaginação esperançosa aplanava as estradas difíceis...", author: "Rachel de Queiroz", work: "O Quinze", year: 1930, source: "https://www.record.com.br/blogs/news/o-quinze-de-rachel-de-queiroz" },
  { text: "Fugir de novo, aboletar-se noutro lugar, recomeçar a vida.", author: "Graciliano Ramos", work: "Vidas Secas", year: 1938, source: "https://curriculo.sedu.es.gov.br/curriculo/wp-content/uploads/2025/06/RPE_LP_3_Q_10_24_04_25.pdf" },
  { text: "Eu sou a ramada\ndessas árvores,\nsem nome e sem valia", author: "Cora Coralina", work: "Minha Cidade", year: 1965, source: "https://sme.goiania.go.gov.br/conexaoescola/eaja/lingua-portuguesa-a-poesia-goiana-e-o-lirismo-de-cora-coralina/" },
  { text: "E o silêncio alargando tudo...", author: "Mário de Andrade", work: "Macunaíma", year: 1928, source: "https://pt.wikisource.org/wiki/Macuna%C3%ADma/1928/VIII" },
  { text: "Só a Antropofagia nos une.", author: "Oswald de Andrade", work: "Manifesto Antropófago", year: 1928, source: "https://bndigital.bn.gov.br/dossies/rede-da-memoria-virtual-brasileira/artes/o-modernismo/" },
  { text: "Não sei, só sei que foi assim.", author: "Ariano Suassuna", work: "Auto da Compadecida", year: 1955, source: "https://goias.gov.br/educacao/wp-content/uploads/sites/40/2024/10/REVISA-GOIAS-9o-ANO-LP-E-MAT_OUTUBRO-E-NOVEMBRO_ESTUDANTE.pdf" },
  { text: "É preciso conhecer a fome para saber descrevê-la.", author: "Carolina Maria de Jesus", work: "Quarto de Despejo", year: 1960, source: "https://sites.unipampa.edu.br/lehl/2018/10/21/uma-analise-sobre-a-obra-quarto-de-despejo-de-carolina-maria-de-jesus-por-rafael-barbosa/" },
  { text: "Uma molécula disse sim a outra molécula e nasceu a vida.", author: "Clarice Lispector", work: "A Hora da Estrela", year: 1977, source: "https://prefeitura.sp.gov.br/web/cultura/w/bibliotecas/noticias/25259" },
  { text: "E no mar e no céu — a imensidade!", author: "Castro Alves", work: "O Navio Negreiro", year: 1869, source: "https://pt.wikisource.org/wiki/Navio_negreiro" },
  { text: "Eu canto porque o instante existe\ne a minha vida está completa.", author: "Cecília Meireles", work: "Viagem · Motivo", year: 1939, source: "https://wp.ufpel.edu.br/aulusmm/2020/03/25/motivo-cecilia-meireles/" },
  { text: "O sertão é do tamanho do mundo.", author: "João Guimarães Rosa", work: "Grande Sertão: Veredas", year: 1956, source: "https://curriculo.sedu.es.gov.br/curriculo/wp-content/uploads/2024/05/lp3serie16semana1721jun24290524.pdf" },
  { text: "Hoje sabe de todas as suas ruas e de todos os seus becos.", author: "Jorge Amado", work: "Capitães da Areia", year: 1937, source: "https://curriculo.sedu.es.gov.br/curriculo/wp-content/uploads/2025/06/9o_LP_RPE_Quinzena-12_LIVRETO.pdf" },
  { text: "Depois, o mundo é grande e no Amazonas sempre há borracha…", author: "Rachel de Queiroz", work: "O Quinze", year: 1930, source: "https://www.record.com.br/blogs/news/o-quinze-de-rachel-de-queiroz" },
  { text: "As arribações bebiam a água.", author: "Graciliano Ramos", work: "Vidas Secas", year: 1938, source: "https://curriculo.sedu.es.gov.br/curriculo/wp-content/uploads/2025/06/RPE_LP_3_Q_10_24_04_25.pdf" },
  { text: "Eu sou aquela menina feia da ponte da Lapa.", author: "Cora Coralina", work: "Minha Cidade", year: 1965, source: "https://sme.goiania.go.gov.br/conexaoescola/eaja/lingua-portuguesa-a-poesia-goiana-e-o-lirismo-de-cora-coralina/" },
  { text: "Era vasto o paraná e não tinha uma nuvem na gupiara elevada do céu.", author: "Mário de Andrade", work: "Macunaíma", year: 1928, source: "https://pt.wikisource.org/wiki/Macuna%C3%ADma/1928/VIII" },
  { text: "Só me interessa o que não é meu.", author: "Oswald de Andrade", work: "Manifesto Antropófago", year: 1928, source: "https://www.gov.br/bn/pt-br/central-de-conteudos/producao/publicacoes/colecoes/revista-poesia-sempre/ps38_digital.pdf" },
  { text: "Mas era vivo quando eu tinha o bicho.", author: "Ariano Suassuna", work: "Auto da Compadecida", year: 1955, source: "https://goias.gov.br/educacao/wp-content/uploads/sites/40/2024/10/REVISA-GOIAS-9o-ANO-LP-E-MAT_OUTUBRO-E-NOVEMBRO_ESTUDANTE.pdf" },
  ...BALANCED_DAILY_LITERARY_QUOTES,
];

export function quoteForDay(now: Date) {
  const dateParts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => Number(dateParts.find((item) => item.type === type)?.value);
  const dayNumber = Math.floor(Date.UTC(part("year"), part("month") - 1, part("day")) / 86_400_000);
  return DAILY_LITERARY_QUOTES[dayNumber % DAILY_LITERARY_QUOTES.length]!;
}
