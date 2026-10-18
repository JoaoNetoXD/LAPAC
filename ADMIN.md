# Painel da LAPAC — https://lapac-ufpi.vercel.app/admin

A diretoria atualiza o site sozinha, sem programador: integrantes e fotos, agenda,
processo seletivo (abrir/fechar inscrições, edital, resultado), documentos em PDF,
galeria, contato e áreas.

## Como usar (diretoria)

1. Abra **lapac-ufpi.vercel.app/admin** e digite a senha.
2. Escolha a aba (Integrantes, Agenda, Seleção, Documentos, Galeria, Contato, Áreas).
3. Toque num item para abrir, edite o texto, envie fotos/PDFs.
   - Fotos de pessoas são cortadas em quadrado e reduzidas automaticamente.
   - PDFs até 3 MB (se for maior, comprima em ilovepdf.com).
   - Setas ↑ ↓ mudam a ordem; ✕ exclui.
4. Clique em **Publicar no site**. Em cerca de 1 minuto o site atualiza.
   - **Desfazer** descarta o que ainda não foi publicado.
   - Se duas pessoas editarem ao mesmo tempo, a segunda recebe um aviso para recarregar.

## Ativação (uma vez só — quem administra a conta da Vercel/GitHub)

O painel grava as alterações no repositório do GitHub; a Vercel publica sozinha.
Ele precisa de duas "chaves" configuradas na Vercel:

### 1. Criar um token do GitHub
1. GitHub → foto do perfil → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Nome: `painel-lapac` · Expiração: 1 ano (anote para renovar).
3. **Repository access**: *Only select repositories* → `JoaoNetoXD/LAPAC`.
4. **Permissions → Repository permissions → Contents: Read and write**.
5. Gere e copie o token (começa com `github_pat_`).

### 2. Colocar as chaves na Vercel
Vercel → projeto **lapac-ufpi** → **Settings** → **Environment Variables** → adicione (ambiente *Production*):

| Nome | Valor |
|---|---|
| `GITHUB_TOKEN` | o token copiado acima |
| `ADMIN_PASSWORD` | a senha que a diretoria vai usar (forte, 12+ caracteres) |

Depois: **Deployments** → último deploy → **⋯** → **Redeploy**.

Pronto: o painel funciona em `/admin`.

### Trocar a senha
Altere `ADMIN_PASSWORD` na Vercel e faça **Redeploy**. Quem estava logado sai automaticamente.

## Segurança
- A senha e o token ficam só na Vercel (nunca no site nem no GitHub).
- O login vale por 12 horas na aba do navegador.
- Todo envio do painel vira um registro no histórico do GitHub (dá para desfazer qualquer mudança por lá).
