"use client";

import Image from "next/image";

export const LITERARY_AVATARS = [
  { slot: 0, name: "Machado de Assis", years: "1839–1908", image: "avatar-machado-de-assis.png", bio: "Romancista, contista e cronista carioca, foi um dos fundadores da Academia Brasileira de Letras. Em Memórias póstumas de Brás Cubas, renovou a narrativa brasileira com ironia e um narrador que conta a própria vida após a morte.", source: "https://www2.academia.org.br/academicos/machado-de-assis/biografia" },
  { slot: 1, name: "Carolina Maria de Jesus", years: "1914–1977", image: "avatar-maria-carolina-de-jesus.png", bio: "Escritora mineira que registrou o cotidiano da favela do Canindé, em São Paulo. Seus diários deram origem a Quarto de despejo, obra que tornou sua voz conhecida no Brasil e no exterior.", source: "https://antigo.bn.gov.br/sites/default/files/documentos/miscelanea/2019/20190312_guia-4980.pdf" },
  { slot: 2, name: "Clarice Lispector", years: "1920–1977", image: "avatar-clarice-lispector.png", bio: "Romancista e contista de escrita introspectiva, viveu boa parte da infância no Recife. Em A hora da estrela, acompanha Macabéa, uma jovem nordestina que tenta sobreviver no Rio de Janeiro.", source: "https://site.claricelispector.ims.com.br/livro/a-hora-da-estrela/" },
  { slot: 3, name: "Carlos Drummond de Andrade", years: "1902–1987", image: "avatar-carlos-drummond-andrade.png", bio: "Poeta e cronista mineiro, tornou-se uma voz central do modernismo brasileiro. Seu livro de estreia, Alguma poesia, reúne versos marcados pela linguagem cotidiana, pela reflexão e pelo humor.", source: "https://www2.academia.org.br/artigos/o-ano-drummond" },
  { slot: 4, name: "Conceição Evaristo", years: "1946–", image: "avatar-conceicao-evaristo.png", bio: "Escritora mineira cuja obra dá voz à memória e às experiências de mulheres negras. O livro de contos Olhos d’água é uma de suas publicações mais conhecidas.", source: "https://www.letras.ufmg.br/literafro/Autors/188-conceicao-evaristo" },
  { slot: 5, name: "S. R. Ranganathan", years: "1892–1972", image: "avatar-ranganathan.png", bio: "Bibliotecário e matemático indiano que ajudou a transformar a organização e o acesso às bibliotecas. Publicou As cinco leis da biblioteconomia, referência para profissionais da área.", source: "https://www.ucl.ac.uk/about/search-faces-ucl/reading-revolution-sr-ranganathan-father-library-science" },
  { slot: 6, name: "Cecília Meireles", years: "1901–1964", image: "avatar-cecilia-meireles.png", bio: "Poeta, professora e jornalista carioca, escreveu versos de forte musicalidade e reflexão sobre o tempo. Romanceiro da Inconfidência recria poeticamente episódios da história de Minas Gerais.", source: "https://www.academia.org.br/artigos/cecilia-meireles-deusa-e-poeta" },
  { slot: 7, name: "Julieta Carteado", years: "1927–1994", image: "avatar-julieta-carteado.png", bio: "Bibliotecária, artista plástica e poeta baiana, dirigiu por dez anos a Biblioteca Central da Universidade Estadual de Feira de Santana. Sua atuação na biblioteca e na vida cultural da cidade é preservada pelo memorial que leva seu nome.", source: "https://portal.febab.org.br/cbbd2022/article/view/2664" },
  { slot: 8, name: "Jorge Amado", years: "1912–2001", image: "avatar-jorge-amado.png", bio: "Romancista baiano que retratou a vida, a cultura e as desigualdades de seu estado. Gabriela, cravo e canela é uma de suas obras mais conhecidas e difundidas.", source: "https://www2.academia.org.br/academicos/jorge-amado/biografia" },
  { slot: 9, name: "Bernadete Sinay Neves", years: "datas não confirmadas", image: "avatar-bernadete-sinay-neves.png", bio: "Engenheira civil e pioneira da biblioteconomia baiana, ajudou a criar a Escola de Biblioteconomia e Documentação da UFBA. Organizou a biblioteca da Escola Politécnica, que hoje leva seu nome.", source: "https://eng.ufba.br/sites/eng.ufba.br/files/mulheres_da_escola_politecnica_da_ufba.pdf" },
  { slot: 10, name: "Edson Nery da Fonseca", years: "1921–2014", image: "avatar-edson-nery-da-fonseca.png", bio: "Bibliotecário e professor pernambucano, participou da criação de cursos de biblioteconomia e da formação de profissionais no Brasil. Introdução à Biblioteconomia é uma de suas obras mais conhecidas.", source: "https://portal.febab.org.br/cbbd2024/article/view/3515" },
  { slot: 11, name: "Cora Coralina", years: "1889–1985", image: "avatar-cora-coralina.png", bio: "Poeta e contista goiana que escreveu sobre a cidade de Goiás e a vida cotidiana. Publicou seu primeiro livro, Poemas dos becos de Goiás e estórias mais, já na maturidade.", source: "https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/arte-a-cultura-goiana-e-cora-coralina/" },
  { slot: 12, name: "Manuel Bastos Tigre", years: "1882–1957", image: "avatar-manuel-bastos-tigre.png", bio: "Bibliotecário, poeta e jornalista pernambucano, trabalhou em instituições como a Biblioteca Nacional. Seu nascimento, em 12 de março, inspirou a escolha da data do Dia do Bibliotecário no Brasil.", source: "https://bndigital.bn.gov.br/dossies/periodicos-literatura/personagens-periodicos-literatura/bastos-tigre/" },
  { slot: 13, name: "Paul Otlet", years: "1868–1944", image: "avatar-paul-otlet.png", bio: "Documentalista belga que, com Henri La Fontaine, criou a Classificação Decimal Universal e projetou o Mundaneum. Seu trabalho buscou organizar e tornar acessível o conhecimento produzido no mundo.", source: "https://catalogue.bnf.fr/ark:/12148/cb12922802s" },
  { slot: 14, name: "Itamar Vieira Junior", years: "1979–", image: "avatar-itamar-vieira-junior.png", bio: "Escritor baiano cuja ficção aborda relações com a terra, memória e desigualdade social. Torto arado, seu romance mais conhecido, recebeu os prêmios LeYa, Oceanos e Jabuti.", source: "https://todavialivros.com.br/livros/torto-arado" },
  { slot: 15, name: "Melvil Dewey", years: "1851–1931", image: "avatar-melvil-dewey.png", bio: "Bibliotecário norte-americano que criou a Classificação Decimal de Dewey. O sistema organiza livros por assuntos em classes numéricas e se tornou uma referência duradoura para bibliotecas.", source: "https://www.oclc.org/en/dewey/resources/timeline.html" },
  { slot: 16, name: "Ariano Suassuna", years: "1927–2014", image: "avatar-ariano-suassuna.png", bio: "Dramaturgo e romancista paraibano ligado à cultura popular nordestina. O auto da Compadecida, sua peça mais conhecida, mistura humor, cordel e tradições do sertão.", source: "https://www.academia.org.br/academicos/ariano-suassuna/biografia" },
  { slot: 24, name: "Ailton Krenak", years: "1953–", image: "avatar-ailton-krenak.png", bio: "Escritor, pensador e liderança indígena do povo Krenak. Em Ideias para adiar o fim do mundo, propõe refletir sobre a relação entre humanidade, natureza e modos de viver.", source: "https://www.academia.org.br/academicos/ailton-krenak/biografia" },
] as const;

export function avatarChoiceFor(id: string, choice?: number | null) {
  if (typeof choice === "number" && Number.isInteger(choice) && choice >= 0 && choice < 75) {
    const slot = Math.floor(choice / 3);
    return (LITERARY_AVATARS.find((avatar) => avatar.slot === slot) ?? LITERARY_AVATARS[slot % LITERARY_AVATARS.length]).slot * 3;
  }
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return LITERARY_AVATARS[hash % LITERARY_AVATARS.length].slot * 3;
}

export function LiteraryAvatar({ id, label, choice, small = false }: { id: string; label: string; choice?: number | null; small?: boolean }) {
  const slot = avatarChoiceFor(id, choice) / 3;
  const avatar = LITERARY_AVATARS.find((item) => item.slot === slot) ?? LITERARY_AVATARS[0];
  return <span className={`literary-avatar${small ? " literary-avatar--small" : ""}`} role="img" aria-label={`Avatar de ${label}, inspirado em ${avatar.name}`}>
    <Image src={`/avatars/${avatar.image}`} alt="" width={160} height={160} sizes={small ? "32px" : "(max-width: 600px) 80px, 160px"} />
  </span>;
}
