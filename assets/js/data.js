/* =========================================================================
   LAPAC — CONTEÚDO EDITÁVEL DO SITE
   -------------------------------------------------------------------------
   Tudo que muda com frequência fica aqui. Não precisa mexer no HTML.

   FOTOS: coloque o arquivo em assets/img/equipe/ (ex.: maria.webp, 600x600)
          e preencha  foto: "assets/img/equipe/maria.webp"
          Sem foto, o site mostra as iniciais com o degradê da marca.
   NOMES: deixe nome: "" para mostrar "Em breve".
   LINKS: deixe "" (vazio) para esconder o botão.
   DATAS: formato "AAAA-MM-DD" (ex.: "2027-03-14").
   ========================================================================= */

window.LAPAC = {
  /* ---------------- CONTATO & REDES ---------------- */
  contato: {
    email: "ligaacademicadedepatologia.ufpi@gmail.com",
    instagram: "lapac.ufpi",                // TODO: confirmar @ (sem o @)
    endereco: "Centro de Ciências Agrárias (CCA) — Campus Universitário Ministro Petrônio Portella, Bairro Ininga, Teresina — PI",
    mapaBusca: "Centro de Ciências Agrárias UFPI Teresina",
  },

  /* ---------------- ÁREAS DE ATUAÇÃO (lâminas) ----------------
     arte: "smear" | "cyto" | "tissue" | "crystal" | "egg" | "plate"   */
  areas: [
    {
      titulo: "Hematologia", rotulo: "PANÓT.", arte: "smear", seed: 53,
      resumo: "Avaliação do sangue e de seus componentes, base de quase todo diagnóstico clínico.",
      exames: [
        { nome: "Hemograma", pontos: "Eritrograma (hematócrito, hemoglobina, hemácias e índices), leucograma total e diferencial, plaquetas." },
        { nome: "Esfregaço sanguíneo", pontos: "Morfologia de hemácias, leucócitos e plaquetas; confirmação das contagens." },
        { nome: "Pesquisa de hemoparasitas", pontos: "Identificação de Babesia, Anaplasma e mórulas de Ehrlichia." },
      ],
    },
    {
      titulo: "Citologia", rotulo: "PANÓT.", arte: "cyto", seed: 41,
      resumo: "Estudo de células coletadas de lesões, órgãos e líquidos, com resultado rápido e coleta pouco invasiva.",
      exames: [
        { nome: "PAAF", pontos: "Punção aspirativa por agulha fina de nódulos, massas e linfonodos." },
        { nome: "Imprint e raspado", pontos: "Lesões de pele e superfícies; diferencia inflamação, hiperplasia e neoplasia." },
        { nome: "Análise de efusões", pontos: "Líquidos cavitários classificados em transudato, transudato modificado ou exsudato." },
      ],
    },
    {
      titulo: "Histopatologia", rotulo: "H&E", arte: "tissue", seed: 23,
      resumo: "Análise microscópica de tecidos, padrão para o diagnóstico definitivo de muitas lesões.",
      exames: [
        { nome: "Biópsia", pontos: "Incisional ou excisional, fixada em formol a 10% logo após a coleta." },
        { nome: "Processamento e coloração", pontos: "Inclusão em parafina, microtomia e coloração por hematoxilina e eosina (H&E)." },
        { nome: "Laudo histopatológico", pontos: "Diagnóstico morfológico, classificação de neoplasias e avaliação de margens cirúrgicas." },
      ],
    },
    {
      titulo: "Urinálise", rotulo: "SEDIM.", arte: "crystal", seed: 79,
      resumo: "Exame de urina que avalia a função renal e o trato urinário e reflete alterações sistêmicas.",
      exames: [
        { nome: "Exame físico", pontos: "Cor, aspecto, odor e densidade urinária." },
        { nome: "Exame químico", pontos: "Tira reagente: pH, proteína, glicose, corpos cetônicos, sangue oculto e bilirrubina." },
        { nome: "Sedimentoscopia", pontos: "Células, cilindros, cristais e microrganismos; amostra analisada logo após a coleta." },
      ],
    },
    {
      titulo: "Parasitologia", rotulo: "LUGOL", arte: "egg", seed: 97,
      resumo: "Identificação de parasitas internos e externos e da carga parasitária dos animais.",
      exames: [
        { nome: "Coproparasitológico", pontos: "Técnicas de flutuação e sedimentação para ovos, oocistos e larvas." },
        { nome: "OPG", pontos: "Contagem de ovos por grama de fezes, usada no controle de verminoses em rebanhos." },
        { nome: "Raspado cutâneo", pontos: "Pesquisa de ácaros como Demodex e Sarcoptes." },
      ],
    },
    {
      titulo: "Microbiologia", rotulo: "ÁGAR", arte: "plate", seed: 131,
      resumo: "Isolamento e identificação de bactérias e fungos para orientar o tratamento.",
      exames: [
        { nome: "Cultura e isolamento", pontos: "Bacteriana e fúngica, a partir de amostras coletadas de forma asséptica." },
        { nome: "Coloração de Gram", pontos: "Classificação inicial em Gram-positivas e Gram-negativas." },
        { nome: "Antibiograma", pontos: "Teste de sensibilidade aos antimicrobianos, base para o uso racional de antibióticos." },
      ],
    },
  ],

  /* ---------------- PROCESSO SELETIVO ----------------
     status: "em-breve" | "aberto" | "encerrado" | "resultado"          */
  selecao: {
    status: "em-breve",
    titulo: "Processo Seletivo 2027.1",
    previsao: "Previsto para o semestre 2027.1",
    linkInscricao: "",                      // link do Google Forms
    edital: "",                             // ex.: "docs/edital-2027-1.pdf"
    resultado: "",                          // ex.: "docs/resultado-2027-1.pdf"
    etapas: [
      { titulo: "Edital", texto: "Publicação do edital com vagas, cronograma e critérios aqui no site e no Instagram." },
      { titulo: "Inscrição", texto: "Preenchimento do formulário e envio dos documentos exigidos no edital." },
      { titulo: "Avaliação", texto: "Etapas de avaliação definidas no edital." },
      { titulo: "Resultado", texto: "Divulgação da lista de aprovados aqui no site e no Instagram." },
      { titulo: "Integração", texto: "Início das atividades com os ligantes." },
    ],
    // TODO: conferir com o edital
    requisitos: [
      "Estar regularmente matriculado(a) no curso de Medicina Veterinária da UFPI",
      "Cumprir os critérios de período e disciplinas definidos no edital",
      "Ter disponibilidade para as reuniões e atividades da liga",
    ],
    // TODO: conferir com o edital
    beneficios: [
      "Certificado de horas complementares",
      "Capacitação teórica e prática em análises clínicas",
      "Participação em pesquisa, extensão e eventos científicos",
      "Contato com a rotina laboratorial",
    ],
  },

  /* ---------------- EQUIPE ---------------- */
  orientadores: [
    {
      nome: "Nome da Professora",            // TODO
      cargo: "Orientadora",
      foto: "",
      formacao: [                             // TODO: preencher com o currículo real
        "Graduação em Medicina Veterinária",
        "Mestrado em …",
        "Doutorado em …",
      ],
      atuacao: "Docente do curso de Medicina Veterinária da UFPI. Área de atuação: …",
      lattes: "",                             // link do Currículo Lattes
      email: "",
    },
  ],

  diretoria: [
    { nome: "", cargo: "Presidente" },
    { nome: "", cargo: "Vice-presidente" },
    { nome: "", cargo: "Secretaria" },
    { nome: "", cargo: "Tesouraria" },
    { nome: "", cargo: "Diretoria de Ensino" },
    { nome: "", cargo: "Diretoria de Pesquisa" },
    { nome: "", cargo: "Diretoria de Extensão" },
    { nome: "", cargo: "Diretoria de Comunicação" },
  ],

  // 12 vagas de ligantes — preencha nome/foto quando houver
  membros: Array.from({ length: 12 }, () => ({ nome: "", foto: "" })),

  /* ---------------- AGENDA ----------------
     Vazio = mostra "Em breve".
     Exemplo: { data: "2027-03-20", hora: "18h30", titulo: "Aula inaugural", tipo: "Palestra", local: "Auditório do CCA", link: "" } */
  eventos: [],

  /* ---------------- GALERIA ----------------
     Coloque as fotos em assets/img/galeria/ e liste aqui.            */
  galeria: [
    // { src: "assets/img/galeria/aula-inaugural.webp", legenda: "Aula inaugural" },
  ],

  /* ---------------- TRANSPARÊNCIA ---------------- */
  documentos: [
    { titulo: "Regimento Interno", descricao: "Funcionamento da liga, cargos, frequência, carga horária e certificação.", arquivo: "" },
    { titulo: "Edital do Processo Seletivo", descricao: "Vagas, cronograma, etapas e critérios da seleção 2027.1.", arquivo: "" },
    { titulo: "Estatuto", descricao: "Natureza, finalidades, estrutura e regras gerais da liga.", arquivo: "" },
  ],
};
