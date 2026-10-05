# Site LAPAC — Liga Acadêmica de Patologia e Análises Clínicas (UFPI)

Site estático (HTML + CSS + JS puro). Não precisa de instalação nem de build.

## Estrutura

```
index.html              página única com todas as seções
assets/js/data.js       ← TODO O CONTEÚDO EDITÁVEL (equipe, agenda, seleção, contatos…)
assets/js/main.js       renderização, microscópio animado e cenas de scroll
assets/js/icons.js      ícones (Lucide, só os usados — 4 KB)
assets/vendor/          GSAP + ScrollTrigger (animações) e Lenis (scroll suave)
assets/css/style.css    visual (cores da marca no topo do arquivo)
assets/img/             logo, emblema, favicon, imagem de compartilhamento
docs/                   coloque aqui os PDFs (edital, estatuto, resultado…)
```

## Como editar (só o `assets/js/data.js`)

| O que | Onde em `data.js` |
|---|---|
| E-mail, Instagram, endereço | `contato` |
| Abrir/fechar seleção, datas, link do Forms, edital, resultado | `selecao` (`status`: `em-breve`, `aberto`, `encerrado`, `resultado`) |
| Orientadores, diretoria, ligantes | `orientadores`, `diretoria`, `membros` |
| Agenda de eventos | `eventos` (passados vão sozinhos para a aba "Anteriores") |
| Trabalhos publicados | `publicacoes` |
| Fotos da galeria | `galeria` |
| Estatuto, regimento, editais | `documentos` |

**Fotos da equipe:** salve em `assets/img/equipe/` (ideal: 600×750, `.webp` ou `.jpg`) e preencha `foto: "assets/img/equipe/nome.webp"`. Sem foto, aparecem as iniciais.

**PDFs:** coloque em `docs/` e preencha, por exemplo, `edital: "docs/edital-2026-2.pdf"`.

**Números da seção Sobre** (8 áreas, +20 ligantes…): no `index.html`, procure `data-count`.

## ⚠️ Conferir antes de publicar

Estão com conteúdo provisório, só para exemplo:
- e-mail `lapac.ufpi@gmail.com` e Instagram `@lapac.ufpi`
- nomes da equipe, eventos e datas da agenda, datas da seleção
- números da seção "Sobre"
- publicações

## Animações

- Preloader "ajustando foco" → abertura sincronizada (título, ondas, lente, legendas das células)
- Lente com esfregaço sanguíneo animado em canvas (reage ao mouse)
- Manifesto: a lente abre com o scroll e as palavras acendem
- Áreas: lâminas de vidro deslizando na horizontal (no celular: arrastar com o dedo)
- Atividades: cards que empilham; faixas de texto que aceleram com o scroll
- Seleção: caminho que se desenha conforme rola
- Cursor-retículo e botões magnéticos (só no computador)

Se o sistema estiver com "reduzir movimento" (Windows: Configurações → Acessibilidade →
Efeitos visuais → Efeitos de animação), o site mantém as animações e só desliga o scroll suave.

## Ver no computador

```bash
python -m http.server 5510
```
Depois abra http://localhost:5510

## Publicar de graça

- **Netlify Drop:** arraste a pasta em https://app.netlify.com/drop
- **GitHub Pages:** suba a pasta num repositório → Settings → Pages → branch `main`
- **Vercel:** importe o repositório (sem configuração)

Depois de publicar, troque `https://lapac-ufpi.example/` no `<link rel="canonical">` do `index.html` pelo endereço real.

## Formulário de contato

Hoje ele abre o app de e-mail da pessoa com a mensagem pronta (funciona sem servidor).
Se quiser receber direto na caixa de entrada, crie um formulário grátis no Formspree e troque o envio em `initForm()` no `main.js`.
