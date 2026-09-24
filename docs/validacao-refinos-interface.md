# Refinamentos da interface — 24/09/2026

## Implementado

- Idioma detectado na entrada a partir da preferência do navegador, com seleção persistida em cookie e armazenamento local. O menu com globo fica no rodapé e oferece uma sugestão opcional quando a escolha diverge do idioma do dispositivo.
- Formulário sem seletor próprio; revisão em colunas de pendências e itens conferidos, agrupados por etapa e seção; contadores nas abas e explicação junto ao envio bloqueado.
- Guia do link público destacado abaixo do aviso. Contraste como botão com ícone e atalhos 1 a 4 reorganizados.
- Barra lateral compacta por padrão, com expansão sobre o conteúdo ao passar o mouse ou focar pelo teclado; logo liga ao site público.

## Verificação

- `npm run verify`: 120 testes, tipos, lint e build aprovados. O lint mantém um aviso anterior em catalogação assistida.
- Prévia local sem banco: conferidos contadores, revisão, bloqueio de envio, troca de idioma e rodapé. Captura em `evidencia-refinos-interface.png`.

## Trabalho restante

- A tradução integral de todas as páginas públicas e internas ainda não foi implementada. A preferência já chega ao formulário e a partes compartilhadas, mas outros textos permanecem em português. A interface inteira não deve ser anunciada como multilíngue até concluir os catálogos de tradução por tela.
- Sem sessão autenticada disponível na prévia, o comportamento da barra lateral no painel não teve verificação visual com navegação real. O layout foi checado por tipos e build.
