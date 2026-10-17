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
| As 6 áreas (texto e exames de cada lâmina) | `areas` |
| Seleção: status, link do Forms, edital, resultado, etapas, requisitos, benefícios | `selecao` (`status`: `em-breve`, `aberto`, `encerrado`, `resultado`) |
| Orientadora (currículo, Lattes), diretoria (8), ligantes (12) | `orientadores`, `diretoria`, `membros` — `nome: ""` mostra "Em breve" |
| Agenda de eventos | `eventos` (vazio mostra "Em breve") |
| Fotos da galeria | `galeria` |
| Regimento, edital e estatuto | `documentos` |

**Fotos da equipe:** salve em `assets/img/equipe/` (ideal: 600×750, `.webp` ou `.jpg`) e preencha `foto: "assets/img/equipe/nome.webp"`. Sem foto, aparecem as iniciais.

**PDFs:** coloque em `docs/` e preencha, por exemplo, `edital: "docs/edital-2026-2.pdf"`.


## ⚠️ Conferir antes de publicar

Pendências da reunião:
- Requisitos e benefícios: conferir com o edital (Cecília e Ingrid)
- Transparência: PDFs do Regimento Interno, Edital e Estatuto
- Fotos da diretoria: Ana Caroline, Lara Machado, Maria Clara (e cargo da Ingrid)
- Orientadora: link do Lattes (opcional)
- Confirmar Instagram `@lapac.ufpi` (e-mail: `ligaacademicadedepatologia.ufpi@gmail.com`)

## Animações

- Preloader "ajustando foco" → abertura sincronizada (título, ondas, lente, legendas das células)
- Lente com esfregaço sanguíneo animado em canvas (reage ao mouse)
- Áreas: 6 lâminas de vidro deslizando na horizontal (no celular: arrastar com o dedo)
- Como a liga funciona: cards que empilham; duas faixas com as áreas em sentidos opostos
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

Depois de publicar, troque `https://lapac-ufpi.vercel.app/` no `<link rel="canonical">` do `index.html` pelo endereço real.

## Formulário de contato

Hoje ele abre o app de e-mail da pessoa com a mensagem pronta (funciona sem servidor).
Se quiser receber direto na caixa de entrada, crie um formulário grátis no Formspree e troque o envio em `initForm()` no `main.js`.
