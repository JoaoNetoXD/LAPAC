/* Painel LAPAC — edita assets/js/data.js via /api (Vercel) e publica no GitHub. */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const TOKEN_KEY = "lapac-admin-token";

  /* ---------------- estrutura do conteúdo (o que aparece no painel) ---------------- */
  const TIPOS_EVENTO = ["Palestra", "Minicurso", "Capacitação", "Grupo de discussão", "Extensão", "Simpósio", "Reunião", "Outro"];
  const SECTIONS = [
    {
      id: "equipe", label: "Integrantes", hint: "Orientação, diretoria e ligantes. Fotos são cortadas em quadrado automaticamente.",
      fields: [
        { key: "orientadores", type: "array", label: "Orientação", add: "Adicionar orientador(a)", title: (it) => it.nome, blank: { nome: "", cargo: "Orientadora", foto: "", atuacao: "", formacao: [], lattes: "", email: "" },
          item: [
            { key: "nome", label: "Nome" }, { key: "cargo", label: "Cargo" },
            { key: "foto", type: "image", pasta: "equipe", label: "Foto" },
            { key: "atuacao", type: "textarea", label: "Atuação (texto curto)" },
            { key: "formacao", type: "list", label: "Currículo — formação", add: "Adicionar linha" },
            { key: "lattes", type: "url", label: "Link do Currículo Lattes" }, { key: "email", label: "E-mail (opcional)" },
          ] },
        { key: "diretoria", type: "array", label: "Diretoria", add: "Adicionar membro da diretoria", title: (it) => `${it.nome || "Sem nome"} — ${it.cargo || ""}`, blank: { nome: "", cargo: "", foto: "" },
          item: [{ key: "nome", label: "Nome" }, { key: "cargo", label: "Cargo" }, { key: "foto", type: "image", pasta: "equipe", label: "Foto" }] },
        { key: "membros", type: "array", label: "Ligantes", hint: "Ligante sem nome aparece como “Em breve”.", add: "Adicionar ligante", title: (it) => it.nome || "Em breve", blank: { nome: "", foto: "" },
          item: [{ key: "nome", label: "Nome" }, { key: "foto", type: "image", pasta: "equipe", label: "Foto" }] },
      ],
    },
    {
      id: "agenda", label: "Agenda", hint: "Eventos passados vão sozinhos para “Anteriores”. Sem eventos, o site mostra “Em breve”.",
      fields: [
        { key: "eventos", type: "array", label: "Eventos", add: "Adicionar evento", title: (it) => `${fmtData(it.data)} · ${it.titulo || "Sem título"}`, blank: { data: "", hora: "", titulo: "", tipo: "Palestra", local: "", link: "" },
          item: [
            { key: "titulo", label: "Título" }, { key: "tipo", type: "select", label: "Tipo", options: TIPOS_EVENTO },
            { key: "data", type: "date", label: "Data" }, { key: "hora", label: "Horário", placeholder: "18h30" },
            { key: "local", label: "Local" }, { key: "link", type: "url", label: "Link de inscrição (opcional)" },
          ] },
      ],
    },
    {
      id: "selecao", label: "Seleção", hint: "Abra e feche as inscrições, publique o edital e o resultado.",
      fields: [
        { key: "selecao.semestre", label: "Semestre da próxima seleção", placeholder: "2027.1" },
        { key: "selecao.status", type: "select", label: "Situação", options: [["em-breve", "Em breve"], ["aberto", "Inscrições abertas"], ["encerrado", "Inscrições encerradas"], ["resultado", "Resultado disponível"]] },
        { key: "selecao.linkInscricao", type: "url", label: "Link do formulário de inscrição", help: "O botão “Fazer inscrição” só aparece com a situação “Inscrições abertas”." },
        { key: "selecao.edital", type: "file", pasta: "docs", label: "Edital (PDF)" },
        { key: "selecao.resultado", type: "file", pasta: "docs", label: "Resultado (PDF)" },
        { key: "selecao.etapas", type: "array", label: "Etapas", add: "Adicionar etapa", title: (it, i) => `Etapa ${i + 1} — ${it.titulo || ""}`, blank: { titulo: "", texto: "" },
          item: [{ key: "titulo", label: "Título" }, { key: "texto", type: "textarea", label: "Descrição" }] },
        { key: "selecao.requisitos", type: "list", label: "Requisitos", add: "Adicionar requisito" },
        { key: "selecao.beneficios", type: "list", label: "Benefícios", add: "Adicionar benefício" },
      ],
    },
    {
      id: "documentos", label: "Documentos", hint: "Aparecem como pastas na página Transparência. Envie o PDF para liberar o botão “Baixar”.",
      fields: [
        { key: "documentos", type: "array", label: "Documentos", add: "Adicionar documento", title: (it) => it.titulo, blank: { titulo: "", descricao: "", arquivo: "" },
          item: [{ key: "titulo", label: "Título" }, { key: "descricao", type: "textarea", label: "Descrição" }, { key: "arquivo", type: "file", pasta: "docs", label: "Arquivo (PDF)" }] },
      ],
    },
    {
      id: "galeria", label: "Galeria", hint: "Fotos de “Registros de bancada”. São reduzidas automaticamente para carregar rápido.",
      fields: [
        { key: "galeria", type: "array", label: "Fotos", add: "Adicionar foto", title: (it) => it.legenda || "Foto", blank: { src: "", legenda: "" },
          item: [{ key: "src", type: "image", pasta: "galeria", wide: true, label: "Foto" }, { key: "legenda", label: "Legenda" }] },
      ],
    },
    {
      id: "contato", label: "Contato",
      fields: [
        { key: "contato.email", label: "E-mail da liga" },
        { key: "contato.instagram", label: "Instagram", help: "Só o @, sem link. Ex.: lapac.ufpi" },
        { key: "contato.endereco", type: "textarea", label: "Endereço" },
        { key: "contato.mapaBusca", label: "Busca do mapa", help: "Texto usado para posicionar o mapa do Google." },
      ],
    },
    {
      id: "areas", label: "Áreas", hint: "As lâminas da página Áreas de atuação.",
      fields: [
        { key: "areas", type: "array", label: "Áreas", add: "Adicionar área", title: (it) => it.titulo, blank: { titulo: "", rotulo: "", arte: "tissue", seed: 11, resumo: "", exames: [] },
          item: [
            { key: "titulo", label: "Título" }, { key: "rotulo", label: "Etiqueta da lâmina", placeholder: "H&E" },
            { key: "arte", type: "select", label: "Desenho da lâmina", options: [["smear", "Esfregaço de sangue"], ["cyto", "Citologia"], ["tissue", "Tecido (H&E)"], ["crystal", "Cristais (urina)"], ["egg", "Ovos (parasitas)"], ["plate", "Placa de cultura"]] },
            { key: "resumo", type: "textarea", label: "Resumo" },
            { key: "exames", type: "array", label: "Exames", add: "Adicionar exame", title: (it) => it.nome, blank: { nome: "", pontos: "" },
              item: [{ key: "nome", label: "Exame" }, { key: "pontos", type: "textarea", label: "Pontos principais" }] },
          ] },
      ],
    },
  ];

  /* ---------------- estado ---------------- */
  let token = sessionStorage.getItem(TOKEN_KEY) || "";
  let data = null, saved = "", sha = "", current = "equipe";
  const previews = new Map(); // caminho enviado -> blob local (o site só mostra após publicar)

  const fmtData = (s) => (s ? s.split("-").reverse().join("/") : "sem data");
  const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  const setPath = (obj, path, v) => { const ks = path.split("."); const last = ks.pop(); const t = ks.reduce((o, k) => (o[k] ??= {}), obj); t[last] = v; };
  const dirty = () => JSON.stringify(data) !== saved;

  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "class") el.className = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return el;
  }

  /** troca o conteúdo de um elemento aceitando listas e ignorando vazios */
  function fill(el, ...kids) {
    el.replaceChildren(...kids.flat(Infinity).filter((k) => k != null && k !== false).map((k) => (k.nodeType ? k : document.createTextNode(String(k)))));
    return el;
  }

  function toast(msg, err) {
    const t = $("#toast");
    t.textContent = msg; t.classList.toggle("is-err", !!err); t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), err ? 7000 : 4500);
  }

  async function api(path, body) {
    const r = await fetch(`/api/${path}`, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    let j = {};
    try { j = await r.json(); } catch { j = { error: `Erro ${r.status}` }; }
    if (r.status === 401 && path !== "login") { logout(); throw new Error(j.error || "Sessão expirada."); }
    if (!r.ok || !j.ok) { const e = new Error(j.error || `Erro ${r.status}`); e.status = r.status; throw e; }
    return j;
  }

  /* ---------------- arquivos ---------------- */
  const toBase64 = (blob) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob); });

  async function prepareImage(file, square) {
    const img = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
    if (!img) throw new Error("Não foi possível ler a imagem. Use JPG ou PNG.");
    let sx = 0, sy = 0, sw = img.width, sh = img.height, w, hgt;
    if (square) {
      const s = Math.min(sw, sh); sx = (sw - s) / 2; sy = Math.max(0, (sh - s) * 0.3); sw = sh = s; w = hgt = 600; // rosto costuma ficar no terço de cima
    } else {
      const k = Math.min(1, 1600 / Math.max(sw, sh)); w = Math.round(sw * k); hgt = Math.round(sh * k);
    }
    const c = document.createElement("canvas"); c.width = w; c.height = hgt;
    c.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, w, hgt);
    const type = c.toDataURL("image/webp").startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
    const blob = await new Promise((r) => c.toBlob(r, type, 0.82));
    return { blob, ext: type === "image/webp" ? "webp" : "jpg" };
  }

  async function uploadFile(file, pasta, opts = {}) {
    let blob = file, ext = file.name.split(".").pop().toLowerCase();
    if (pasta === "docs") {
      if (ext !== "pdf") throw new Error("Envie um arquivo PDF.");
      if (file.size > 3.2 * 1024 * 1024) throw new Error("PDF grande demais (máx. 3 MB). Comprima em ilovepdf.com e tente de novo.");
    } else {
      ({ blob, ext } = await prepareImage(file, !opts.wide));
    }
    const nome = `${file.name.replace(/\.[^.]+$/, "")}.${ext}`;
    const { path } = await api("upload", { pasta, nome, base64: await toBase64(blob) });
    previews.set(path, URL.createObjectURL(blob));
    return path;
  }
  const srcOf = (p) => previews.get(p) || (p ? `/${p}` : "");

  /* ---------------- campos ---------------- */
  function field(def, obj, path, onChange) {
    const val = getPath(obj, path) ?? "";
    const id = `f-${path.replace(/[^a-z0-9]/gi, "-")}-${Math.random().toString(36).slice(2, 7)}`;
    const wrap = (control) => h("label", { class: "fld", for: id }, h("span", {}, def.label), control, def.help && h("small", {}, def.help));
    const set = (v) => { setPath(obj, path, v); onChange(); };

    if (def.type === "textarea") return wrap(h("textarea", { id, rows: 3, oninput: (e) => set(e.target.value) }, val));
    if (def.type === "select") {
      const sel = h("select", { id, onchange: (e) => set(e.target.value) },
        def.options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return h("option", { value: v, selected: v === val }, l); }));
      return wrap(sel);
    }
    if (def.type === "list") return listField(def, obj, path, onChange);
    if (def.type === "array") return arrayField(def, obj, path, onChange);
    if (def.type === "image" || def.type === "file") return mediaField(def, obj, path, onChange);
    const input = h("input", { id, type: def.type === "url" ? "url" : def.type === "date" ? "date" : "text", value: val, placeholder: def.placeholder, inputmode: def.type === "url" ? "url" : null, oninput: (e) => set(e.target.value.trim() === "" ? "" : e.target.value) });
    return wrap(input);
  }

  function mediaField(def, obj, path, onChange) {
    const isImg = def.type === "image";
    const box = h("div", { class: "fld" }, h("span", {}, def.label));
    const render = () => {
      const val = getPath(obj, path) || "";
      const input = h("input", { type: "file", hidden: true, accept: isImg ? "image/*" : "application/pdf" });
      const row = h("div", { class: "media" },
        isImg ? (val ? h("img", { class: `media__thumb${def.wide ? " media__thumb--wide" : ""}`, src: srcOf(val), alt: "" }) : h("div", { class: `media__thumb${def.wide ? " media__thumb--wide" : ""}` })) : null,
        h("div", { class: "media__btns" },
          h("button", { type: "button", class: "btn btn--ghost btn--sm", onclick: () => input.click() }, val ? (isImg ? "Trocar foto" : "Trocar PDF") : (isImg ? "Enviar foto" : "Enviar PDF")),
          val && !isImg ? h("a", { class: "btn btn--ghost btn--sm", href: srcOf(val), target: "_blank", rel: "noopener" }, "Abrir") : null,
          val ? h("button", { type: "button", class: "btn btn--danger btn--sm", onclick: () => { setPath(obj, path, ""); onChange(); render(); } }, "Remover") : null),
        val && !isImg ? h("span", { class: "media__name" }, val.split("/").pop()) : null,
        input);
      input.addEventListener("change", async () => {
        const file = input.files[0]; if (!file) return;
        box.classList.add("busy"); toast(isImg ? "Enviando foto…" : "Enviando PDF…");
        try { setPath(obj, path, await uploadFile(file, def.pasta, def)); onChange(); render(); toast("Arquivo enviado. Clique em “Publicar no site” para aplicar."); }
        catch (e) { toast(e.message, true); }
        finally { box.classList.remove("busy"); }
      });
      fill(box, h("span", {}, def.label), row);
    };
    render();
    return box;
  }

  function listField(def, obj, path, onChange) {
    if (!Array.isArray(getPath(obj, path))) setPath(obj, path, []);
    const box = h("div", { class: "fld" });
    const render = () => {
      const arr = getPath(obj, path);
      fill(box, h("span", {}, def.label),
        h("div", { class: "strs" }, arr.map((v, i) => h("div", { class: "str" },
          h("input", { type: "text", value: v, "aria-label": `${def.label} ${i + 1}`, oninput: (e) => { arr[i] = e.target.value; onChange(); } }),
          h("button", { type: "button", class: "btn btn--icon", title: "Remover", "aria-label": "Remover", onclick: () => { arr.splice(i, 1); onChange(); render(); } }, "✕")))),
        h("button", { type: "button", class: "btn btn--ghost btn--sm add", onclick: () => { arr.push(""); onChange(); render(); box.querySelector(".str:last-child input")?.focus(); } }, `+ ${def.add || "Adicionar"}`));
    };
    render();
    return box;
  }

  function arrayField(def, obj, path, onChange) {
    if (!Array.isArray(getPath(obj, path))) setPath(obj, path, []);
    const card = h("section", { class: "card" });
    const render = (openIdx) => {
      const arr = getPath(obj, path);
      const items = arr.map((it, i) => {
        const titleEl = h("span", { class: "item__title" }, def.title ? def.title(it, i) || "—" : `${i + 1}`);
        const body = h("div", { class: "grid grid--2" });
        const details = h("details", { class: "item", open: openIdx === i },
          h("summary", { class: "item__bar" }, titleEl,
            h("button", { type: "button", class: "btn btn--icon", title: "Subir", "aria-label": "Subir", disabled: i === 0, onclick: (e) => { e.preventDefault(); [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; onChange(); render(i - 1); } }, "↑"),
            h("button", { type: "button", class: "btn btn--icon", title: "Descer", "aria-label": "Descer", disabled: i === arr.length - 1, onclick: (e) => { e.preventDefault(); [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; onChange(); render(i + 1); } }, "↓"),
            h("button", { type: "button", class: "btn btn--icon", title: "Excluir", "aria-label": "Excluir", onclick: (e) => { e.preventDefault(); if (confirm(`Excluir “${titleEl.textContent}”?`)) { arr.splice(i, 1); onChange(); render(); } } }, "✕")),
          body);
        // conteúdo só é montado ao abrir (listas grandes ficam leves)
        const build = () => { if (body.childElementCount) return; def.item.forEach((d) => { const el = field(d, it, d.key, () => { titleEl.textContent = def.title ? def.title(it, i) || "—" : ""; onChange(); }); if (["array", "list", "textarea"].includes(d.type) || d.type === "image" || d.type === "file") el.style.gridColumn = "1 / -1"; body.append(el); }); };
        details.addEventListener("toggle", () => details.open && build());
        if (openIdx === i) build();
        return details;
      });
      fill(card, 
        h("div", { class: "card__head" }, h("h3", {}, `${def.label} (${arr.length})`)),
        def.hint ? h("p", { class: "hint" }, def.hint) : null,
        h("div", { class: "items" }, items),
        h("button", { type: "button", class: "btn btn--ghost btn--sm add", onclick: () => { arr.push(structuredClone(def.blank || {})); onChange(); render(arr.length - 1); } }, `+ ${def.add || "Adicionar"}`));
    };
    render();
    return card;
  }

  /* ---------------- telas ---------------- */
  function renderTabs() {
    fill($("#tabs"), ...SECTIONS.map((s) => h("button", { class: "tab", role: "tab", "aria-selected": s.id === current, onclick: () => { current = s.id; renderTabs(); renderPanel(); window.scrollTo(0, 0); } }, s.label)));
  }

  function renderPanel() {
    const s = SECTIONS.find((x) => x.id === current);
    const simple = s.fields.filter((f) => !["array", "list"].includes(f.type));
    const complex = s.fields.filter((f) => ["array", "list"].includes(f.type));
    const onChange = () => updateBar();
    fill($("#panel"), 
      h("h2", {}, s.label), s.hint ? h("p", { class: "hint" }, s.hint) : null,
      simple.length ? h("section", { class: "card" }, h("div", { class: "grid grid--2" }, simple.map((f) => { const el = field(f, data, f.key, onChange); if (["textarea", "file", "image"].includes(f.type)) el.style.gridColumn = "1 / -1"; return el; }))) : null,
      complex.map((f) => (f.type === "list" ? h("section", { class: "card" }, field(f, data, f.key, onChange)) : field(f, data, f.key, onChange))));
  }

  function updateBar() {
    const d = dirty();
    $("#bar").classList.toggle("is-dirty", d);
    $("#status").textContent = d ? "Não publicado" : "Tudo publicado.";
    $("#publish").disabled = !d;
    $("#discard").hidden = !d;
  }

  async function load() {
    fill($("#panel"), h("p", { class: "hint" }, "Carregando conteúdo…"));
    try {
      const j = await api("content");
      data = j.data; sha = j.sha; saved = JSON.stringify(data);
      if (data.selecao && !data.selecao.semestre) data.selecao.semestre = "2027.1";
      renderTabs(); renderPanel(); updateBar();
    } catch (e) {
      fill($("#panel"), h("div", { class: "setup" }, e.message));
    }
  }

  async function publish() {
    const btn = $("#publish");
    btn.disabled = true; btn.textContent = "Publicando…";
    try {
      const tab = SECTIONS.find((x) => x.id === current).label;
      const j = await api("content", { data, sha, resumo: tab });
      sha = j.sha; saved = JSON.stringify(data); updateBar();
      toast("Publicado! O site atualiza em cerca de 1 minuto.");
    } catch (e) {
      toast(e.message, true); updateBar();
    } finally { btn.textContent = "Publicar no site"; }
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY); token = "";
    $("#app").hidden = true; $("#login").hidden = false; $("#login-pass").value = "";
  }

  function start() {
    $("#login").hidden = true; $("#app").hidden = false;
    load();
  }

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("#login-msg"), btn = e.target.querySelector("button");
    msg.textContent = ""; btn.disabled = true; btn.textContent = "Entrando…";
    try {
      const j = await api("login", { password: $("#login-pass").value });
      token = j.token; sessionStorage.setItem(TOKEN_KEY, token); start();
    } catch (err) { msg.textContent = err.message; }
    finally { btn.disabled = false; btn.textContent = "Entrar"; }
  });
  $("#publish").addEventListener("click", publish);
  $("#discard").addEventListener("click", () => { if (confirm("Desfazer as alterações não publicadas?")) { data = JSON.parse(saved); renderPanel(); updateBar(); } });
  $("#logout").addEventListener("click", () => { if (!dirty() || confirm("Há alterações não publicadas. Sair mesmo assim?")) logout(); });
  window.addEventListener("beforeunload", (e) => { if (data && dirty()) { e.preventDefault(); e.returnValue = ""; } });

  if (token) start(); else $("#login").hidden = false;
})();
