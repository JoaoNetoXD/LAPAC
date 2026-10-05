/* =========================================================================
   LAPAC — CONTEÚDO EDITÁVEL DO SITE
   -------------------------------------------------------------------------
   Tudo que muda com frequência fica aqui. Não precisa mexer no HTML.

   FOTOS: coloque o arquivo em assets/img/equipe/ (ex.: maria.webp, 600x750)
          e preencha  foto: "assets/img/equipe/maria.webp"
          Sem foto, o site mostra as iniciais com o degradê da marca.
   LINKS: deixe "" (vazio) para esconder o ícone/botão.
   DATAS: formato "AAAA-MM-DD" (ex.: "2026-11-14").
   ========================================================================= */

window.LAPAC = {
  /* ---------------- CONTATO & REDES ---------------- */
  contato: {
    email: "lapac.ufpi@gmail.com",          // TODO: confirmar e-mail oficial
    instagram: "lapac.ufpi",                // TODO: confirmar @ (sem o @)
    whatsapp: "",                           // ex.: "5586999999999" (opcional)
    endereco: "Centro de Ciências Agrárias (CCA) — Campus Universitário Ministro Petrônio Portella, Bairro Ininga, Teresina — PI",
    mapaBusca: "Centro de Ciências Agrárias UFPI Teresina",
  },

  /* ---------------- PROCESSO SELETIVO ----------------
     status: "em-breve" | "aberto" | "encerrado" | "resultado"          */
  selecao: {
    status: "em-breve",
    titulo: "Processo Seletivo 2026.2",
    inscricoesInicio: "2026-11-03",
    inscricoesFim: "2026-11-14",
    linkInscricao: "",                      // link do Google Forms
    edital: "",                             // ex.: "docs/edital-2026-2.pdf"
    resultado: "",                          // ex.: "docs/resultado-2026-2.pdf"
    vagas: "A definir em edital",
    etapas: [
      { titulo: "Inscrição", texto: "Preenchimento do formulário on-line e envio dos documentos exigidos no edital." },
      { titulo: "Prova objetiva", texto: "Conteúdos de patologia geral e análises clínicas veterinárias indicados no edital." },
      { titulo: "Entrevista", texto: "Conversa com a diretoria sobre interesses, disponibilidade e expectativas com a liga." },
      { titulo: "Resultado", texto: "Divulgação da lista de aprovados aqui no site e no Instagram." },
      { titulo: "Integração", texto: "Aula inaugural, apresentação das diretorias e início das atividades." },
    ],
    requisitos: [
      "Estar regularmente matriculado(a) no curso de Medicina Veterinária da UFPI",
      "Ter cursado as disciplinas indicadas no edital",
      "Disponibilidade para as reuniões e atividades da liga",
      "Interesse genuíno por patologia e diagnóstico laboratorial",
    ],
  },

  /* ---------------- EQUIPE ---------------- */
  orientadores: [
    { nome: "Nome do(a) Professor(a)", cargo: "Orientador(a)", detalhe: "Departamento de Clínica e Cirurgia Veterinária", foto: "", lattes: "", instagram: "" },
    { nome: "Nome do(a) Professor(a)", cargo: "Coorientador(a)", detalhe: "Departamento de Morfofisiologia Veterinária", foto: "", lattes: "", instagram: "" },
  ],

  diretoria: [
    { nome: "Nome Sobrenome", cargo: "Presidente", detalhe: "Medicina Veterinária · 7º período", foto: "", instagram: "", lattes: "" },
    { nome: "Nome Sobrenome", cargo: "Vice-presidente", detalhe: "Medicina Veterinária · 6º período", foto: "", instagram: "", lattes: "" },
    { nome: "Nome Sobrenome", cargo: "Secretaria Geral", detalhe: "Medicina Veterinária · 5º período", foto: "", instagram: "", lattes: "" },
    { nome: "Nome Sobrenome", cargo: "Tesouraria", detalhe: "Medicina Veterinária · 5º período", foto: "", instagram: "", lattes: "" },
    { nome: "Nome Sobrenome", cargo: "Diretoria de Ensino", detalhe: "Medicina Veterinária · 6º período", foto: "", instagram: "", lattes: "" },
    { nome: "Nome Sobrenome", cargo: "Diretoria de Pesquisa", detalhe: "Medicina Veterinária · 7º período", foto: "", instagram: "", lattes: "" },
    { nome: "Nome Sobrenome", cargo: "Diretoria de Extensão", detalhe: "Medicina Veterinária · 4º período", foto: "", instagram: "", lattes: "" },
    { nome: "Nome Sobrenome", cargo: "Comunicação e Marketing", detalhe: "Medicina Veterinária · 4º período", foto: "", instagram: "", lattes: "" },
  ],

  membros: [
    { nome: "Ligante 01", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 02", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 03", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 04", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 05", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 06", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 07", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 08", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 09", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 10", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 11", detalhe: "Medicina Veterinária", foto: "" },
    { nome: "Ligante 12", detalhe: "Medicina Veterinária", foto: "" },
  ],

  /* ---------------- AGENDA ----------------
     tipo: "Palestra" | "Minicurso" | "Grupo de estudo" | "Extensão" | "Simpósio" | "Reunião" */
  eventos: [
    { data: "2026-10-16", hora: "18h30", titulo: "Aula inaugural LAPAC", tipo: "Palestra", local: "Auditório do CCA — UFPI", link: "" },
    { data: "2026-10-30", hora: "14h00", titulo: "Hemograma na prática: do esfregaço ao laudo", tipo: "Minicurso", local: "Laboratório de Patologia Clínica — HVU", link: "" },
    { data: "2026-11-21", hora: "08h00", titulo: "Ação de extensão: Zoonoses e posse responsável", tipo: "Extensão", local: "Teresina — PI", link: "" },
    { data: "2026-12-05", hora: "08h00", titulo: "I Simpósio de Patologia e Análises Clínicas Veterinárias", tipo: "Simpósio", local: "UFPI — Teresina", link: "" },
  ],

  /* ---------------- PRODUÇÃO CIENTÍFICA ---------------- */
  publicacoes: [
    { ano: "2026", tipo: "Resumo", titulo: "Título do trabalho apresentado pela liga", evento: "Nome do congresso / revista", link: "" },
    { ano: "2026", tipo: "Relato de caso", titulo: "Título do relato de caso", evento: "Nome do congresso / revista", link: "" },
    { ano: "2026", tipo: "Projeto", titulo: "Título do projeto de pesquisa em andamento", evento: "PIBIC / PIBEX — UFPI", link: "" },
  ],

  /* ---------------- GALERIA ----------------
     Coloque as fotos em assets/img/galeria/ e liste aqui.
     Enquanto vazio, mostra quadros "em breve".                         */
  galeria: [
    // { src: "assets/img/galeria/aula-inaugural.webp", legenda: "Aula inaugural 2026" },
  ],

  /* ---------------- DOCUMENTOS ---------------- */
  documentos: [
    { titulo: "Estatuto da LAPAC", descricao: "Regras de funcionamento, cargos, direitos e deveres dos ligantes.", arquivo: "" },
    { titulo: "Regimento Interno", descricao: "Frequência, carga horária, certificação e conduta.", arquivo: "" },
    { titulo: "Edital do Processo Seletivo", descricao: "Vagas, cronograma, conteúdo programático e critérios.", arquivo: "" },
    { titulo: "Resultado da Seleção", descricao: "Lista de aprovados(as) da última seleção.", arquivo: "" },
  ],
};
