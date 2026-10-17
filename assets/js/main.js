/* LAPAC — renderização (data.js), microscópio animado e cenas de scroll (GSAP + Lenis) */
(() => {
  "use strict";

  const D = window.LAPAC || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const hasGsap = !!(gsap && ST);
  if (hasGsap) { gsap.registerPlugin(ST); root.classList.add("has-gsap"); }

  const esc = (v = "") => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name) => `<i data-lucide="${name}"></i>`;
  /** aceita só http(s), mailto e caminhos relativos (bloqueia javascript: etc.) */
  const safeUrl = (u = "") => {
    const v = String(u).trim();
    if (!v) return "#";
    if (/^(https?:|mailto:)/i.test(v) || !/^[a-z][a-z0-9+.-]*:/i.test(v)) return esc(v);
    return "#";
  };
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const parseDate = (s) => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const fmtDate = (s) => parseDate(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
  const today = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const initials = (nome = "") => { const p = nome.trim().split(/\s+/).filter(Boolean); return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() : "?"; };

  /** PRNG determinístico (mesma lâmina sempre igual) */
  const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const f1 = (n) => n.toFixed(1);

  /* =====================================================================
     AMOSTRAS PROCEDURAIS (lâminas das áreas e galeria)
     ===================================================================== */
  function blobPath(cx, cy, rx, ry, n, jitter, r) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = 1 + (r() - 0.5) * jitter;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`;
    }
    return d + "Z";
  }
  const inEllipse = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;

  function specimenSVG(seed, kind) {
    const r = rng(seed);
    const id = `sp${seed}${kind}`;
    const cx = 150, cy = 70, rx = 118, ry = 52;
    let defs = "", body = "";

    if (kind === "tissue") {
      const blob = blobPath(cx, cy, rx, ry, 14, 0.35, r);
      defs = `<radialGradient id="${id}g" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#f7cfe0"/><stop offset=".65" stop-color="#e48bb5"/><stop offset="1" stop-color="#c4528a"/></radialGradient><clipPath id="${id}c"><path d="${blob}"/></clipPath>`;
      let inner = "";
      const glands = seed % 2 === 1 && seed > 20;
      if (glands) {
        for (let g = 0; g < 7; g++) {
          const gx = cx + (r() - 0.5) * rx * 1.6, gy = cy + (r() - 0.5) * ry * 1.4, gr = 7 + r() * 7;
          inner += `<circle cx="${f1(gx)}" cy="${f1(gy)}" r="${f1(gr)}" fill="#fff4f8"/>`;
          for (let a = 0; a < Math.PI * 2; a += 0.42) inner += `<ellipse cx="${f1(gx + Math.cos(a) * (gr + 3))}" cy="${f1(gy + Math.sin(a) * (gr + 3))}" rx="2.4" ry="1.5" transform="rotate(${f1((a * 180) / Math.PI)} ${f1(gx + Math.cos(a) * (gr + 3))} ${f1(gy + Math.sin(a) * (gr + 3))})" fill="#4a1f5c" opacity=".85"/>`;
        }
      }
      for (let i = 0; i < 190; i++) {
        const x = cx + (r() - 0.5) * rx * 2.1, y = cy + (r() - 0.5) * ry * 2.1;
        inner += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(1.4 + r() * 2)}" ry="${f1(1 + r() * 1.4)}" transform="rotate(${Math.round(r() * 180)} ${f1(x)} ${f1(y)})" fill="#4a1f5c" opacity="${f1(0.45 + r() * 0.5)}"/>`;
      }
      for (let v = 0; v < 2; v++) {
        const vx = cx + (r() - 0.5) * rx, vy = cy + (r() - 0.5) * ry, vr = 8 + r() * 6;
        inner += `<ellipse cx="${f1(vx)}" cy="${f1(vy)}" rx="${f1(vr * 1.5)}" ry="${f1(vr)}" fill="#fff7fa" stroke="#c4528a" stroke-width=".8"/>`;
        for (let k = 0; k < 4; k++) inner += `<circle cx="${f1(vx + (r() - 0.5) * vr * 1.6)}" cy="${f1(vy + (r() - 0.5) * vr * 0.9)}" r="2.2" fill="#d8708f"/>`;
      }
      body = `<path d="${blob}" fill="url(#${id}g)"/><g clip-path="url(#${id}c)">${inner}</g>`;
    }

    if (kind === "organ") {
      const blob = blobPath(cx, cy, rx * 0.95, ry * 0.95, 12, 0.3, r);
      defs = `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b2466a"/><stop offset=".5" stop-color="#8a2c4f"/><stop offset="1" stop-color="#561637"/></linearGradient><clipPath id="${id}c"><path d="${blob}"/></clipPath>`;
      let inner = "";
      for (let i = 0; i < 60; i++) inner += `<circle cx="${f1(cx + (r() - 0.5) * rx * 2)}" cy="${f1(cy + (r() - 0.5) * ry * 2)}" r="${f1(3 + r() * 9)}" fill="${r() > 0.5 ? "#c9668b" : "#4a1031"}" opacity="${f1(0.15 + r() * 0.25)}"/>`;
      for (let i = 0; i < 9; i++) { const x = cx + (r() - 0.5) * rx * 1.8; inner += `<path d="M${f1(x)},0 Q${f1(x + (r() - 0.5) * 50)},70 ${f1(x + (r() - 0.5) * 30)},140" stroke="#f4c1d3" stroke-width=".6" fill="none" opacity=".45"/>`; }
      body = `<path d="${blob}" fill="url(#${id}g)"/><g clip-path="url(#${id}c)">${inner}</g><path d="${blob}" fill="none" stroke="#3a0d26" stroke-width="1.4" opacity=".6"/>`;
    }

    if (kind === "cyto") {
      body = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#f3e6f3" opacity=".7"/>`;
      for (let i = 0; i < 46; i++) {
        let x = cx + (r() - 0.5) * rx * 1.9, y = cy + (r() - 0.5) * ry * 1.9;
        if (!inEllipse(x, y, cx, cy, rx, ry)) continue;
        const cr = 4.5 + r() * 5;
        body += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(cr)}" fill="#d6bfe6"/><circle cx="${f1(x + (r() - 0.5) * cr * 0.4)}" cy="${f1(y + (r() - 0.5) * cr * 0.4)}" r="${f1(cr * 0.62)}" fill="#4a1f5c" opacity=".9"/>`;
        if (r() > 0.75) body += `<circle cx="${f1(x + cr * 0.25)}" cy="${f1(y - cr * 0.2)}" r="${f1(cr * 0.14)}" fill="#e48bb5"/>`;
      }
    }

    if (kind === "smear") {
      defs = `<linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#f2b9cf" stop-opacity=".9"/><stop offset=".75" stop-color="#f6d3e1" stop-opacity=".5"/><stop offset="1" stop-color="#fbe7f0" stop-opacity="0"/></linearGradient>`;
      body = `<path d="M22,70 C22,28 90,18 170,22 C230,25 272,40 282,70 C272,100 230,115 170,118 C90,122 22,112 22,70Z" fill="url(#${id}g)"/>`;
      for (let i = 0; i < 230; i++) {
        const x = 30 + r() * 245, y = 26 + r() * 88;
        if (r() > 1 - (x / 300) * 0.75 || !inEllipse(x, y, 152, 70, 130, 48)) continue;
        const cr = 3 + r() * 1.1;
        body += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(cr)}" fill="#e9a3bd" stroke="#cf7598" stroke-width=".5"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(cr * 0.42)}" fill="#f8dfe8"/>`;
      }
      [[88, 60], [160, 84], [210, 50]].forEach(([x, y]) => {
        body += `<circle cx="${x}" cy="${y}" r="7.5" fill="#ecdcf1" stroke="#b58cc6" stroke-width=".5"/>`;
        for (let k = 0; k < 3; k++) body += `<circle cx="${f1(x - 3 + k * 3)}" cy="${f1(y + (k % 2 ? 1.5 : -1.5))}" r="2.2" fill="#4a1f5c"/>`;
      });
    }

    if (kind === "drop") {
      defs = `<radialGradient id="${id}g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fcefd2"/><stop offset=".55" stop-color="#f0c77e"/><stop offset=".9" stop-color="#d9973a"/><stop offset="1" stop-color="#b9802d"/></radialGradient>`;
      body = `<circle cx="112" cy="70" r="48" fill="url(#${id}g)"/><circle cx="112" cy="70" r="46" fill="none" stroke="#a96d1f" stroke-width="1.5" opacity=".45"/><ellipse cx="96" cy="52" rx="14" ry="7" fill="#fff" opacity=".55" transform="rotate(-30 96 52)"/>`;
      const sw = ["#fbf0db", "#f6d8a4", "#f0c77e", "#e48bb5", "#be307b", "#4a1f5c"];
      sw.forEach((c, i) => { body += `<rect x="${186 + (i % 3) * 26}" y="${36 + Math.floor(i / 3) * 36}" width="20" height="28" rx="2" fill="${c}" stroke="rgba(42,18,54,.25)" stroke-width=".6"/>`; });
    }

    if (kind === "crystal") {
      const blob = blobPath(cx, cy, rx, ry, 12, 0.25, r);
      body = `<path d="${blob}" fill="#fbf0db" opacity=".9"/>`;
      for (let i = 0; i < 7; i++) {
        const x = cx + (r() - 0.5) * rx * 1.5, y = cy + (r() - 0.5) * ry * 1.3, s = 6 + r() * 6, a = Math.round(r() * 180);
        body += `<polygon points="${f1(x - s * 1.6)},${f1(y)} ${f1(x - s)},${f1(y - s * 0.7)} ${f1(x + s)},${f1(y - s * 0.7)} ${f1(x + s * 1.6)},${f1(y)} ${f1(x + s)},${f1(y + s * 0.7)} ${f1(x - s)},${f1(y + s * 0.7)}" transform="rotate(${a} ${f1(x)} ${f1(y)})" fill="rgba(255,255,255,.75)" stroke="#4a1f5c" stroke-width=".9"/><line x1="${f1(x - s)}" y1="${f1(y - s * 0.7)}" x2="${f1(x + s)}" y2="${f1(y + s * 0.7)}" transform="rotate(${a} ${f1(x)} ${f1(y)})" stroke="#4a1f5c" stroke-width=".5"/>`;
      }
      for (let i = 0; i < 9; i++) {
        const x = cx + (r() - 0.5) * rx * 1.6, y = cy + (r() - 0.5) * ry * 1.4, s = 3 + r() * 3;
        body += `<g transform="rotate(45 ${f1(x)} ${f1(y)})"><rect x="${f1(x - s)}" y="${f1(y - s)}" width="${f1(s * 2)}" height="${f1(s * 2)}" fill="rgba(255,255,255,.7)" stroke="#a3236b" stroke-width=".8"/></g><path d="M${f1(x - s * 1.4)},${f1(y)}H${f1(x + s * 1.4)}M${f1(x)},${f1(y - s * 1.4)}V${f1(y + s * 1.4)}" stroke="#a3236b" stroke-width=".5"/>`;
      }
    }

    if (kind === "egg") {
      const blob = blobPath(cx, cy, rx, ry, 12, 0.3, r);
      defs = `<radialGradient id="${id}g"><stop offset="0" stop-color="#f6dca8"/><stop offset="1" stop-color="#e0a84a" stop-opacity=".75"/></radialGradient>`;
      body = `<path d="${blob}" fill="url(#${id}g)"/>`;
      for (let i = 0; i < 6; i++) {
        const x = cx + (r() - 0.5) * rx * 1.4, y = cy + (r() - 0.5) * ry * 1.1, a = Math.round(r() * 180);
        body += `<g transform="rotate(${a} ${f1(x)} ${f1(y)})"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="14" ry="9" fill="#f9e7c0" stroke="#7a4e0c" stroke-width="1.4"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="11" ry="6.5" fill="none" stroke="#7a4e0c" stroke-width=".6"/>`;
        for (let k = 0; k < 7; k++) body += `<circle cx="${f1(x + (r() - 0.5) * 14)}" cy="${f1(y + (r() - 0.5) * 7)}" r="1.4" fill="#9a6418" opacity=".7"/>`;
        body += `</g>`;
      }
      for (let i = 0; i < 18; i++) { const x = cx + (r() - 0.5) * rx * 1.7, y = cy + (r() - 0.5) * ry * 1.5; body += `<rect x="${f1(x)}" y="${f1(y)}" width="5" height="1.8" rx=".9" transform="rotate(${Math.round(r() * 180)} ${f1(x)} ${f1(y)})" fill="#4a1f5c" opacity=".8"/>`; }
    }

    if (kind === "plate") {
      // placa de ágar com colônias e discos de antibiograma (halos de inibição)
      const px = 150, py = 70, pr = 62;
      defs = `<radialGradient id="${id}g" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#f6c9db"/><stop offset=".8" stop-color="#e48bb5"/><stop offset="1" stop-color="#c4528a"/></radialGradient><clipPath id="${id}c"><circle cx="${px}" cy="${py}" r="${pr - 3}"/></clipPath>`;
      body = `<circle cx="${px}" cy="${py}" r="${pr}" fill="#fffdfb" stroke="rgba(42,18,54,.35)" stroke-width="1.2"/><circle cx="${px}" cy="${py}" r="${pr - 3}" fill="url(#${id}g)"/>`;
      const disks = [[-30, -24, 15], [30, -22, 10], [-26, 28, 20], [32, 26, 6], [0, 0, 13]];
      let inner = "";
      for (let i = 0; i < 140; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (pr - 5);
        const x = px + Math.cos(a) * d, y = py + Math.sin(a) * d;
        if (disks.some(([dx, dy, h]) => Math.hypot(x - (px + dx), y - (py + dy)) < h + 5)) continue;
        inner += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.2 + r() * 1.8)}" fill="#fbe7f0" stroke="#a3236b" stroke-width=".4" opacity=".95"/>`;
      }
      disks.forEach(([dx, dy, h]) => {
        inner += `<circle cx="${px + dx}" cy="${py + dy}" r="${h + 5}" fill="#f8dbe7" opacity=".85"/><circle cx="${px + dx}" cy="${py + dy}" r="4.5" fill="#fff" stroke="#4a1f5c" stroke-width=".8"/>`;
      });
      body += `<g clip-path="url(#${id}c)">${inner}</g>`;
    }

    return { defs, body };
  }

  function renderAreas() {
    const el = $('[data-render="areas"]');
    if (!el) return;
    el.innerHTML = (D.areas || []).map((a, i) => `
      <article class="slide" data-seed="${+a.seed || 11 + i * 13}" data-kind="${esc(a.arte || "tissue")}">
        <div class="glass"><div class="glass__label mono"><b>LAPAC</b><span>${pad(i + 1)}</span><small>${esc(a.rotulo || "")}</small><i class="barcode"></i></div><div class="glass__sample"><img class="specimen" alt="" width="300" height="140" decoding="async" /></div></div>
        <h3>${esc(a.titulo)}</h3>
        <p>${esc(a.resumo)}</p>
        <ul class="exams">${(a.exames || []).map((x) => `<li><b class="mono">${esc(x.nome)}</b><span>${esc(x.pontos)}</span></li>`).join("")}</ul>
      </article>`).join("");
    const meter = $(".slides__meter > span:first-child");
    if (meter) meter.innerHTML = `<span class="slides__count">01</span> / ${pad((D.areas || []).length)}`;
  }

  /** Gera a amostra como UMA imagem (blob SVG) em vez de milhares de nós no DOM */
  const svgCache = new Map();
  function specimenURL(seed, kind, opts = {}) {
    const key = `${seed}|${kind}|${opts.bg || ""}`;
    if (svgCache.has(key)) return svgCache.get(key);
    const { defs, body } = specimenSVG(seed, kind);
    const inner = opts.bg
      ? `<rect width="300" height="140" fill="${opts.bg}"/><g transform="translate(150 70) scale(1.35) translate(-150 -70)">${body}</g>`
      : body;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 140"${opts.bg ? ' preserveAspectRatio="xMidYMid slice"' : ""}><defs>${defs}</defs>${inner}</svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    svgCache.set(key, url);
    return url;
  }

  function paintSpecimens() {
    $$(".slide").forEach((s) => { $(".specimen", s).src = specimenURL(+s.dataset.seed, s.dataset.kind); });
  }

  /* =====================================================================
     RENDER (data.js)
     ===================================================================== */
  function renderContato() {
    const c = D.contato || {};
    const handle = (c.instagram || "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "");
    const ig = handle ? `https://instagram.com/${handle}` : "";
    $$(".js-instagram").forEach((a) => (ig ? (a.href = ig) : a.setAttribute("hidden", "")));
    $$(".js-instagram-handle").forEach((el) => (el.textContent = `@${handle}`));
    $$(".js-email").forEach((a) => {
      if (!c.email) return a.setAttribute("hidden", "");
      a.href = `mailto:${c.email}`;
      if (!a.querySelector("[data-lucide], svg")) a.textContent = c.email;
    });
    $$(".js-endereco").forEach((el) => (el.textContent = c.endereco || ""));
    const map = $(".js-map");
    if (map && c.mapaBusca) map.dataset.src = `https://www.google.com/maps?q=${encodeURIComponent(c.mapaBusca)}&output=embed`;
  }

  function personPhoto(p) {
    const nome = (p.nome || "").trim();
    if (p.foto) return `<div class="person__photo"><img src="${safeUrl(p.foto)}" alt="Foto de ${esc(nome)}" loading="lazy" /></div>`;
    if (!nome) return `<div class="person__photo person__photo--empty person__photo--soon"><span class="person__soon mono" aria-hidden="true">Em breve</span></div>`;
    return `<div class="person__photo person__photo--empty"><span class="person__initials" aria-hidden="true">${esc(initials(nome))}</span></div>`;
  }

  function personCard(p, prefix, i) {
    const nome = (p.nome || "").trim();
    const links = [];
    if (p.instagram) links.push(`<a href="https://instagram.com/${esc(p.instagram.replace(/^@/, ""))}" target="_blank" rel="noopener" aria-label="Instagram de ${esc(nome)}">${icon("instagram")}</a>`);
    if (p.lattes) links.push(`<a href="${safeUrl(p.lattes)}" target="_blank" rel="noopener" aria-label="Currículo Lattes de ${esc(nome)}">${icon("graduation-cap")}</a>`);
    return `
      <article class="person${nome ? "" : " person--soon"}">
        <div class="person__field">${personPhoto(p)}<span class="person__id mono">LAPAC-${prefix}${pad(i + 1)}</span></div>
        ${p.cargo ? `<span class="person__role mono">${esc(p.cargo)}</span>` : ""}
        <h3 class="person__name">${nome ? esc(nome) : "Em breve"}</h3>
        ${p.detalhe ? `<p class="person__detail">${esc(p.detalhe)}</p>` : ""}
        ${links.length ? `<div class="person__links">${links.join("")}</div>` : ""}
      </article>`;
  }

  /** Orientadora: card largo com currículo */
  function mentorCard(p) {
    const nome = (p.nome || "").trim() || "Em breve";
    const formacao = (p.formacao || []).filter(Boolean);
    const btns = [];
    if (p.lattes) btns.push(`<a class="btn btn--dark btn--sm" href="${safeUrl(p.lattes)}" target="_blank" rel="noopener" data-magnetic><span>Currículo Lattes</span>${icon("arrow-up-right")}</a>`);
    if (p.email) btns.push(`<a class="btn btn--line btn--sm" href="mailto:${esc(p.email)}">${icon("mail")}<span>E-mail</span></a>`);
    return `
      <article class="mentor person">
        <div class="person__field mentor__field">${personPhoto(p)}<span class="person__id mono">LAPAC-O01</span></div>
        <div class="mentor__body">
          <span class="person__role mono">${esc(p.cargo || "Orientadora")}</span>
          <h3 class="mentor__name">${esc(nome)}</h3>
          ${p.atuacao ? `<p class="mentor__text">${esc(p.atuacao)}</p>` : ""}
          ${formacao.length ? `<p class="report__head mono"><span>Currículo</span><span>Formação</span></p><ul class="mentor__cv">${formacao.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
          ${btns.length ? `<div class="mentor__actions">${btns.join("")}</div>` : `<p class="mono mentor__note">Link do Currículo Lattes em breve</p>`}
        </div>
      </article>`;
  }

  function renderEquipe() {
    const or = $('[data-render="orientadores"]');
    if (or) or.innerHTML = (D.orientadores || []).map(mentorCard).join("");
    [["diretoria", "D"], ["membros", "L"]].forEach(([key, prefix]) => {
      const el = $(`[data-render="${key}"]`);
      if (el) el.innerHTML = (D[key] || []).map((p, i) => personCard(p, prefix, i)).join("");
    });
  }

  function gcalLink(ev) {
    const d = parseDate(ev.data);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const f = (x) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}`;
    const params = new URLSearchParams({
      action: "TEMPLATE", text: `${ev.titulo} — LAPAC`, dates: `${f(d)}/${f(next)}`,
      details: `${ev.tipo || "Evento"} da LAPAC — Liga Acadêmica de Patologia e Análises Clínicas (UFPI). ${ev.hora ? "Horário: " + ev.hora : ""}`,
      location: ev.local || "",
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  }

  function renderEventos(filtro = "proximos") {
    const el = $('[data-render="eventos"]');
    if (!el) return;
    const t = today();
    let list = (D.eventos || []).map((e) => ({ ...e, _d: parseDate(e.data) }));
    list = filtro === "proximos" ? list.filter((e) => e._d >= t).sort((a, b) => a._d - b._d) : list.filter((e) => e._d < t).sort((a, b) => b._d - a._d);
    if (!list.length) {
      el.innerHTML = `
        <li class="events__empty">
          <span class="events__empty-badge mono"><span class="rec-dot"></span>Em breve</span>
          <p class="events__empty-title">Ainda não há eventos programados.</p>
          <p class="events__empty-text">Palestras, capacitações e ações de extensão serão divulgadas aqui e no Instagram da liga.</p>
          <a class="btn btn--line btn--sm js-instagram" href="#" target="_blank" rel="noopener">${icon("instagram")}<span>Acompanhar no Instagram</span></a>
        </li>`;
      return;
    }
    el.innerHTML = list.map((e) => {
      const past = e._d < t;
      const cta = past ? "" : e.link
        ? `<a class="btn btn--line btn--sm event__cta" href="${safeUrl(e.link)}" target="_blank" rel="noopener"><span>Inscrever-se</span>${icon("arrow-up-right")}</a>`
        : `<a class="btn btn--line btn--sm event__cta" href="${gcalLink(e)}" target="_blank" rel="noopener">${icon("calendar-plus")}<span>Salvar na agenda</span></a>`;
      return `
        <li class="event${past ? " event--past" : ""}">
          <div class="event__date"><strong>${pad(e._d.getDate())}</strong><span class="mono">${MESES[e._d.getMonth()]}</span></div>
          <h3 class="event__title">${esc(e.titulo)}</h3>
          <div class="event__meta mono">
            <span class="event__type">${esc(e.tipo || "Evento")}</span>
            ${e.hora ? `<span>${icon("clock")} ${esc(e.hora)}</span>` : ""}
            ${e.local ? `<span>${icon("map-pin")} ${esc(e.local)}</span>` : ""}
          </div>
          ${cta}
        </li>`;
    }).join("");
  }

  const STATUS = { "em-breve": "Inscrições em breve", aberto: "Inscrições abertas", encerrado: "Inscrições encerradas", resultado: "Resultado disponível" };

  function renderSelecao() {
    const s = D.selecao || {};
    const st = s.status || "em-breve";
    const statusEl = $('[data-render="selecao-status"]');
    if (statusEl) {
      statusEl.innerHTML = `
        <span class="status-pill status-pill--${esc(st)} mono"><span class="rec-dot"></span>${STATUS[st] || esc(st)}</span>
        <span class="selection__title">${esc(s.titulo || "")}</span>
        ${s.previsao ? `<span class="selection__dates">${esc(s.previsao)}</span>` : ""}`;
    }
    const acoes = $('[data-render="selecao-acoes"]');
    if (acoes) {
      const b = [];
      if (st === "aberto" && s.linkInscricao) b.push(`<a class="btn btn--gold" href="${safeUrl(s.linkInscricao)}" target="_blank" rel="noopener" data-magnetic><span>Fazer inscrição</span>${icon("arrow-right")}</a>`);
      else b.push(`<span class="btn btn--gold is-disabled" aria-disabled="true"><span>${st === "em-breve" ? "Inscrições em breve" : "Inscrições fechadas"}</span></span>`);
      b.push(s.edital
        ? `<a class="btn btn--line" href="${safeUrl(s.edital)}" target="_blank" rel="noopener" data-magnetic>${icon("file-text")}<span>Ler edital</span></a>`
        : `<span class="btn btn--line is-disabled" aria-disabled="true">${icon("file-text")}<span>Edital em breve</span></span>`);
      if (s.resultado) b.push(`<a class="btn btn--line" href="${safeUrl(s.resultado)}" target="_blank" rel="noopener">${icon("award")}<span>Ver resultado</span></a>`);
      acoes.innerHTML = b.join("");
    }
    const etapas = $('[data-render="etapas"]');
    if (etapas) etapas.innerHTML = (s.etapas || []).map((e, i) => `<li><span class="mono">Etapa ${pad(i + 1)}</span><h3>${esc(e.titulo)}</h3><p>${esc(e.texto)}</p></li>`).join("");
    const req = $('[data-render="requisitos"]');
    if (req) req.innerHTML = (s.requisitos || []).map((t) => `<li><span>${esc(t)}</span><i></i><b class="mono">Requisito</b></li>`).join("");
    const ben = $('[data-render="beneficios"]');
    if (ben) ben.innerHTML = (s.beneficios || []).map((t) => `<li><span>${esc(t)}</span><i></i><b class="mono">Sim</b></li>`).join("");
  }

  function renderGaleria() {
    const el = $('[data-render="galeria"]');
    if (!el) return;
    const fotos = D.galeria || [];
    const kinds = ["tissue", "smear", "cyto", "plate", "egg", "crystal"];
    const bgs = ["#2a1236", "#4a1f5c", "#a3236b", "#3a1849"];
    let rows;
    if (!fotos.length) {
      const tile = (i) => {
        return `<div class="film__item"><img data-spec="${200 + i * 7}|${kinds[i % kinds.length]}|${bgs[i % bgs.length]}" alt="" width="300" height="140" decoding="async" /><span class="film__soon mono">Foto em breve · ${pad(i + 1)}</span></div>`;
      };
      rows = [[0, 1, 2, 3, 4, 5].map(tile).join(""), [6, 7, 8, 9, 10, 11].map(tile).join("")];
    } else {
      const item = (f, i) => `<button class="film__item" data-index="${i}" data-cursor="ampliar" aria-label="Ampliar foto: ${esc(f.legenda || "")}"><img src="${safeUrl(f.src)}" alt="${esc(f.legenda || "Foto da LAPAC")}" loading="lazy" />${f.legenda ? `<span class="film__caption mono">${esc(f.legenda)}</span>` : ""}</button>`;
      const a = [], b = [];
      fotos.forEach((f, i) => (i % 2 ? b : a).push(item(f, i)));
      rows = [a.join(""), (b.length ? b : a).join("")];
    }
    el.innerHTML = rows.map((r) => `<div class="film__row"><div class="film__inner">${r}</div></div>`).join("");

    const dlg = $("#lightbox");
    if (!fotos.length || !dlg || typeof dlg.showModal !== "function") return;
    el.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-index]");
      if (!btn) return;
      const f = fotos[+btn.dataset.index];
      $("img", dlg).src = f.src; $("img", dlg).alt = f.legenda || "";
      $(".lightbox__caption", dlg).textContent = f.legenda || "";
      dlg.showModal();
    });
    $(".lightbox__close", dlg).addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  function renderDocumentos() {
    const el = $('[data-render="documentos"]');
    if (!el) return;
    el.innerHTML = (D.documentos || []).map((d, i) => {
      const body = `<h3>${esc(d.titulo)}</h3><p>${esc(d.descricao)}</p><span class="doc__action mono">${d.arquivo ? `Baixar ${icon("download")}` : "Disponível em breve"}</span>`;
      return d.arquivo
        ? `<a class="doc" data-tab="DOC ${pad(i + 1)}" href="${safeUrl(d.arquivo)}" target="_blank" rel="noopener">${body}</a>`
        : `<div class="doc doc--soon" data-tab="DOC ${pad(i + 1)}">${body}</div>`;
    }).join("");
  }

  /* =====================================================================
     MICROSCÓPIO: dial, retículo e esfregaço em canvas
     ===================================================================== */
  function buildDial() {
    const g = $(".scope__ticks");
    if (g) {
      let s = "";
      for (let d = 0; d < 360; d += 5) {
        const a = ((d - 90) * Math.PI) / 180, major = d % 30 === 0;
        const r1 = 286, r2 = major ? 266 : 276;
        s += `<line class="${major ? "major" : ""}" x1="${f1(300 + Math.cos(a) * r1)}" y1="${f1(300 + Math.sin(a) * r1)}" x2="${f1(300 + Math.cos(a) * r2)}" y2="${f1(300 + Math.sin(a) * r2)}"/>`;
        if (major && d !== 150 && d !== 330) s += `<text x="${f1(300 + Math.cos(a) * 304)}" y="${f1(300 + Math.sin(a) * 304 + 4)}" text-anchor="middle">${d}</text>`;
      }
      g.innerHTML = s;
    }
    const rt = $(".scope__reticle-ticks");
    if (rt) {
      let s = "";
      for (let v = 40; v <= 360; v += 8) {
        const l = v % 40 === 0 ? 7 : 3.5;
        s += `<line x1="${v}" y1="${200 - l}" x2="${v}" y2="${200 + l}"/><line x1="${200 - l}" y1="${v}" x2="${200 + l}" y2="${v}"/>`;
      }
      rt.innerHTML = s;
    }
  }

  function initSmear() {
    const canvas = $(".smear");
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const R = rng(7);
    const TAU = Math.PI * 2;
    let w = 0, h = 0, dpr = 1, sprite = null, baseR = 0, running = false, last = performance.now(), t = 0;
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };

    // âncoras (posições batem com os "callouts" do SVG — viewBox 400)
    const anchors = [
      { type: "neutro", x: 120 / 400, y: 128 / 400, r: 0.056 },
      { type: "eos", x: 284 / 400, y: 262 / 400, r: 0.053 },
      { type: "linfo", x: 268 / 400, y: 104 / 400, r: 0.038 },
    ];
    anchors.forEach((a) => { a.gr = Array.from({ length: 80 }, () => [R() * TAU, Math.sqrt(R()) * 0.86, R()]); a.rot = R() * TAU; });

    const cells = Array.from({ length: 95 }, () => ({
      x: R(), y: R(), s: 0.82 + R() * 0.32, depth: 0.4 + R() * 0.9,
      vx: (R() - 0.5) * 0.012, vy: (R() - 0.5) * 0.012, rot: R() * TAU,
    }));
    const platelets = Array.from({ length: 16 }, () => ({ x: R(), y: R(), s: 0.5 + R() * 0.8 }));

    function makeSprite(r) {
      const c = document.createElement("canvas");
      const size = Math.ceil(r * 2 + 6);
      c.width = c.height = size;
      const x = c.getContext("2d"), m = size / 2;
      const g = x.createRadialGradient(m, m, r * 0.05, m, m, r);
      g.addColorStop(0, "#fbe9f0"); g.addColorStop(0.42, "#f4c9da"); g.addColorStop(0.78, "#e8a1bf"); g.addColorStop(1, "#d27a9e");
      x.fillStyle = g; x.beginPath(); x.arc(m, m, r, 0, TAU); x.fill();
      x.lineWidth = Math.max(1, r * 0.07); x.strokeStyle = "rgba(163,35,107,.32)"; x.stroke();
      return c;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseR = w * 0.043;
      sprite = makeSprite(baseR * dpr);
      if (!running) draw(0);
    }

    function drawNeutro(a, cx, cy, r) {
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      g.addColorStop(0, "#f7ecf5"); g.addColorStop(1, "#e3cbe6");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = "rgba(122,63,143,.35)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "rgba(163,35,107,.18)";
      a.gr.forEach(([ang, d]) => { ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * d * r, cy + Math.sin(ang) * d * r, r * 0.025, 0, TAU); ctx.fill(); });
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a.rot + t * 0.05);
      const lobes = [-1.25, -0.4, 0.45, 1.3].map((ang) => [Math.cos(ang) * r * 0.42, Math.sin(ang) * r * 0.42 + r * 0.05]);
      ctx.strokeStyle = "#5a2672"; ctx.lineWidth = r * 0.09; ctx.lineCap = "round";
      ctx.beginPath(); lobes.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      lobes.forEach(([x, y], i) => {
        const lg = ctx.createRadialGradient(x - r * 0.06, y - r * 0.06, 0, x, y, r * 0.27);
        lg.addColorStop(0, "#7a3f8f"); lg.addColorStop(1, "#3a1849");
        ctx.fillStyle = lg; ctx.beginPath(); ctx.ellipse(x, y, r * (0.25 + (i % 2) * 0.03), r * 0.21, i, 0, TAU); ctx.fill();
      });
      ctx.restore();
    }
    function drawEos(a, cx, cy, r) {
      ctx.fillStyle = "#f9e6cf"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = "rgba(185,128,45,.4)"; ctx.lineWidth = 1; ctx.stroke();
      const cols = ["#e0a84a", "#d98b3a", "#f0c77e", "#c9772e"];
      a.gr.forEach(([ang, d, k]) => { ctx.fillStyle = cols[Math.floor(k * 4)]; ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * d * r, cy + Math.sin(ang) * d * r, r * 0.07, 0, TAU); ctx.fill(); });
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a.rot - t * 0.04);
      ctx.fillStyle = "#4a1f5c";
      ctx.beginPath(); ctx.ellipse(-r * 0.3, 0, r * 0.3, r * 0.24, 0.3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r * 0.3, r * 0.04, r * 0.3, r * 0.24, -0.3, 0, TAU); ctx.fill();
      ctx.strokeStyle = "#4a1f5c"; ctx.lineWidth = r * 0.1; ctx.beginPath(); ctx.moveTo(-r * 0.1, 0); ctx.lineTo(r * 0.1, 0); ctx.stroke();
      ctx.restore();
    }
    function drawLinfo(a, cx, cy, r) {
      ctx.fillStyle = "#cbb8e8"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
      const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx + r * 0.06, cy + r * 0.04, r * 0.84);
      g.addColorStop(0, "#6b3a82"); g.addColorStop(1, "#2a1236");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + r * 0.06, cy + r * 0.04, r * 0.82, 0, TAU); ctx.fill();
    }

    function draw(dt) {
      if (!w || !sprite) return;
      ctx.clearRect(0, 0, w, h);
      ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
      const sw = sprite.width / dpr;
      for (const c of cells) {
        c.x += c.vx * dt; c.y += c.vy * dt; c.rot += dt * 0.05;
        if (c.x < -0.08) c.x += 1.16; if (c.x > 1.08) c.x -= 1.16;
        if (c.y < -0.08) c.y += 1.16; if (c.y > 1.08) c.y -= 1.16;
        const px = (c.x - ptr.x * 0.03 * c.depth) * w, py = (c.y - ptr.y * 0.03 * c.depth) * h;
        const size = sw * c.s;
        ctx.drawImage(sprite, px - size / 2, py - size / 2, size, size);
      }
      ctx.fillStyle = "#7a3f8f";
      for (const p of platelets) { ctx.beginPath(); ctx.arc((p.x - ptr.x * 0.02) * w, (p.y - ptr.y * 0.02) * h, w * 0.006 * p.s, 0, TAU); ctx.fill(); }
      for (const a of anchors) {
        const breathe = 1 + Math.sin(t * 1.2 + a.rot) * 0.02;
        const cx = (a.x - ptr.x * 0.015) * w, cy = (a.y - ptr.y * 0.015) * h, r = a.r * w * breathe;
        if (a.type === "neutro") drawNeutro(a, cx, cy, r);
        else if (a.type === "eos") drawEos(a, cx, cy, r);
        else drawLinfo(a, cx, cy, r);
      }
    }

    function loop(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      draw(dt);
      requestAnimationFrame(loop);
    }
    const start = () => { if (running) return; running = true; last = performance.now(); requestAnimationFrame(loop); };
    const stop = () => { running = false; };

    new ResizeObserver(resize).observe(canvas); // mede no ciclo normal de renderização (sem forçar layout no boot)
    new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(canvas);

    const hero = $(".hero");
    if (finePointer && hero) {
      hero.addEventListener("pointermove", (e) => {
        const r = canvas.getBoundingClientRect();
        ptr.tx = Math.max(-1.5, Math.min(1.5, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
        ptr.ty = Math.max(-1.5, Math.min(1.5, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      });
      hero.addEventListener("pointerleave", () => { ptr.tx = 0; ptr.ty = 0; });
    }
    return { start, stop };
  }

  /* =====================================================================
     UTILITÁRIOS DE TEXTO
     ===================================================================== */
  function splitWords(el, wrap) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            frag.appendChild(wrap(p));
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  }
  const maskWord = (word) => { const m = document.createElement("span"); m.className = "w-mask"; const i = document.createElement("span"); i.className = "w-in"; i.textContent = word; m.appendChild(i); return m; };

  /* =====================================================================
     INTERAÇÕES BÁSICAS (funcionam com ou sem GSAP)
     ===================================================================== */
  let lenis = null;

  function scrollToTarget(target) {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  function initNav() {
    const nav = $(".nav");
    const toggle = $(".nav__toggle");
    const menu = $("#menu-mobile");
    let lastY = 0;

    const onScroll = (y) => {
      nav.classList.toggle("is-scrolled", y > 30);
      if (!document.body.classList.contains("menu-open")) nav.classList.toggle("is-hidden", y > lastY && y > window.innerHeight * 0.8);
      lastY = y;
    };
    if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
    else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });

    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      $(".nav__toggle-txt", toggle).textContent = open ? "Fechar" : "Menu";
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      menu.inert = !open;
      document.body.classList.toggle("menu-open", open);
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    closeMenu = () => { if (menu.classList.contains("is-open")) setMenu(false); };
    menu.inert = true;
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); } });
    window.addEventListener("resize", () => { if (window.innerWidth >= 1000 && menu.classList.contains("is-open")) setMenu(false); });

    // links internos: "#/pagina" troca de página (router); "#id" rola até o elemento
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      const menuOpen = menu.classList.contains("is-open");
      if (id.startsWith("#/")) {
        if (menuOpen) setMenu(false);
        if (id === location.hash || (id === "#/" && !location.hash)) { e.preventDefault(); scrollTop(); }
        return; // hashchange cuida do resto
      }
      if (a.hasAttribute("data-totop")) { e.preventDefault(); scrollTop(true); return; }
      if (a.classList.contains("skip-link")) { e.preventDefault(); focusPage(); return; }
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (menuOpen) { setMenu(false); setTimeout(() => scrollToTarget(target), 350); }
      else scrollToTarget(target);
    });
  }

  let closeMenu = () => {};
  function scrollTop(smooth, y = 0) {
    if (lenis) lenis.scrollTo(y, smooth ? { duration: 1.2, force: true } : { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: smooth && !reduceMotion ? "smooth" : "auto" });
  }

  /* =====================================================================
     ROUTER: home com ícones + uma página por seção
     ===================================================================== */
  const PAGES = [
    { id: "sobre", label: "Quem somos" },
    { id: "identidade", label: "Nossa logo" },
    { id: "missao", label: "Missão e valores" },
    { id: "areas", label: "Áreas de atuação" },
    { id: "equipe", label: "Integrantes" },
    { id: "atividades", label: "Como funciona" },
    { id: "agenda", label: "Agenda" },
    { id: "selecao", label: "Processo seletivo" },
    { id: "galeria", label: "Registros de bancada" },
    { id: "documentos", label: "Transparência" },
    { id: "contato", label: "Fale com a diretoria" },
  ];
  const BASE_TITLE = document.title;
  let currentPage = null;

  function currentRoute() {
    const h = location.hash;
    if (h.startsWith("#/")) return h.slice(2) || "home";
    if (h.length > 1 && PAGES.some((p) => p.id === h.slice(1))) return h.slice(1); // links antigos (#selecao)
    return "home";
  }

  const savedY = {};
  function focusPage() {
    const sec = $(`[data-page="${currentPage}"]:not([hidden])`);
    const target = (currentPage === "home" ? null : sec && $("h2, .h2", sec)) || $("#conteudo");
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  function route() {
    let id = currentRoute();
    const idx = PAGES.findIndex((p) => p.id === id);
    if (id !== "home" && idx < 0) id = "home";
    // endereço canônico (#/id) — evita links "mortos" com #antigo ou #/desconhecido
    const canon = id === "home" ? "" : `#/${id}`;
    if (location.hash && location.hash !== canon && !(id === "home" && location.hash === "#/")) history.replaceState(null, "", canon || location.pathname + location.search);
    if (id === currentPage) return;
    const first = currentPage === null;
    if (currentPage !== null) savedY[currentPage] = window.scrollY;
    closeMenu();
    currentPage = id;

    $$("[data-page]").forEach((el) => (el.hidden = el.dataset.page !== id));
    root.classList.toggle("view-home", id === "home");
    root.classList.toggle("view-page", id !== "home");

    const bar = $(".pagebar"), pager = $(".pager");
    bar.hidden = pager.hidden = id === "home";
    if (id !== "home") {
      const p = PAGES[idx];
      $(".pagebar__title").textContent = p.label;
      const prev = PAGES[idx - 1], next = PAGES[idx + 1];
      const pl = $(".pager__prev"), nl = $(".pager__next");
      pl.hidden = !prev; nl.hidden = !next;
      if (prev) { pl.href = `#/${prev.id}`; $("b", pl).textContent = prev.label; }
      if (next) { nl.href = `#/${next.id}`; $("b", nl).textContent = next.label; }
      document.title = `${p.label} — LAPAC UFPI`;
    } else document.title = BASE_TITLE;

    $$(".nav__links a, .mobile-menu__links a").forEach((l) => {
      const on = l.getAttribute("href") === `#/${id}`;
      l.classList.toggle("is-active", on);
      on ? l.setAttribute("aria-current", "page") : l.removeAttribute("aria-current");
    });

    if (!first) {
      scrollTop(false, id === "home" ? savedY.home || 0 : 0);
      focusPage();
    }
    // recalcula medidas (abas, trilho de lâminas, gatilhos de scroll)
    if (id !== "areas") unmountSlides();
    pageAssets(id);
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
      if (hasGsap) {
        pageScenes(id);
        if (id === "areas") mountSlides();
        ST.refresh();
        if (!first) pageEnter(id);
      }
    });
  }

  function pageEnter(id) {
    const els = $$(`[data-page="${id}"]`);
    gsap.fromTo(".pagebar__inner > *", { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" });
    gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out", clearProps: "opacity" });
  }

  function initRouter() {
    window.addEventListener("hashchange", route);
    route();
  }

  function initTabs() {
    const tabs = $$(".turret__btn");
    const ind = $(".turret__indicator");
    const move = (tab) => { if (!ind || !tab) return; ind.style.width = `${tab.offsetWidth}px`; ind.style.transform = `translateX(${tab.offsetLeft}px)`; };
    const activate = (tab, focus) => {
      let shown;
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = $("#" + t.getAttribute("aria-controls"));
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
        if (on) shown = panel;
      });
      move(tab);
      if (focus) tab.focus();
      if (hasGsap && shown) {
        gsap.fromTo($$(".person", shown), { opacity: 0, y: 30, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.05, ease: "power3.out", clearProps: "filter" });
        ST.refresh();
      }
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => activate(t));
      t.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") activate(tabs[(i + 1) % tabs.length], true);
        if (e.key === "ArrowLeft") activate(tabs[(i - 1 + tabs.length) % tabs.length], true);
      });
    });
    const init = () => move($(".turret__btn.is-active"));
    window.addEventListener("resize", init);
    document.fonts?.ready.then(init);
    init();
  }

  function initEventFilter() {
    const btns = $$(".segmented button");
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      renderEventos(b.dataset.filter);
      refreshIcons();
      if (hasGsap) {
        gsap.from(".event", { y: 30, opacity: 0, duration: 0.7, stagger: 0.07, ease: "power3.out" });
        ST.refresh();
      }
    }));
  }

  function initForm() {
    const form = $("#form-contato");
    if (!form) return;
    const note = $(".form-note", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      $$("input, textarea", form).forEach((f) => {
        const valid = f.checkValidity() && f.value.trim() !== "";
        f.closest(".field").classList.toggle("is-invalid", !valid);
        f.setAttribute("aria-invalid", String(!valid));
        if (!valid) ok = false;
      });
      if (!ok) {
        note.textContent = "Preencha todos os campos com um e-mail válido."; note.className = "form-note is-error";
        if (hasGsap) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      const to = (D.contato || {}).email || "";
      const subject = `[Site LAPAC] ${data.assunto} — ${data.nome}`;
      const body = `${data.mensagem}\n\n—\n${data.nome}\n${data.email}`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      note.textContent = `Tentamos abrir seu app de e-mail com a mensagem pronta. Se nada abriu, envie para ${to}.`; note.className = "form-note is-ok";
    });
    $$("input, textarea", form).forEach((f) => f.addEventListener("input", () => f.closest(".field").classList.remove("is-invalid")));
  }

  function initSlidesSwipeMeter() {
    const vp = $(".slides__viewport");
    if (!vp) return;
    const count = $(".slides__count"), bar = $(".slides__bar span"), n = Math.max(1, $$(".slide").length);
    vp.addEventListener("scroll", () => {
      const p = vp.scrollLeft / Math.max(1, vp.scrollWidth - vp.clientWidth);
      count.textContent = pad(Math.min(n, Math.round(p * (n - 1)) + 1));
      bar.style.transform = `scaleX(${Math.max(1 / n, p)})`;
    }, { passive: true });
  }

  /* =====================================================================
     CURSOR + MAGNÉTICO
     ===================================================================== */
  function initCursor() {
    if (!finePointer || !hasGsap) return;
    root.classList.add("has-cursor");
    const cur = $(".cursor"), ring = $(".cursor__ring"), dot = $(".cursor__dot"), label = $(".cursor__label");
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    const dx = gsap.quickTo(dot, "x", { duration: 0.1 }), dy = gsap.quickTo(dot, "y", { duration: 0.1 });
    const lx = gsap.quickTo(label, "x", { duration: 0.3 }), ly = gsap.quickTo(label, "y", { duration: 0.3 });
    window.addEventListener("pointermove", (e) => { cur.classList.add("is-on"); rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); lx(e.clientX); ly(e.clientY); });
    document.addEventListener("pointerover", (e) => {
      const t = e.target;
      const inter = t.closest("a, button, summary, [data-cursor], .slide, .film__item");
      cur.classList.toggle("is-hover", !!inter);
      const lab = inter?.dataset?.cursor || (t.closest(".slide") ? "lâmina" : "");
      label.textContent = lab;
      cur.classList.toggle("has-label", !!lab);
      cur.classList.toggle("is-dark", !!t.closest(".stack-sec, .selection-sec, .footer, .mobile-menu"));
    });
    document.documentElement.addEventListener("pointerleave", () => cur.classList.remove("is-on"));
  }

  function initMagnetic() {
    if (!finePointer || !hasGsap) return;
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" }), yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.28); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
      el.addEventListener("pointerleave", () => { gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)" }); });
    });
  }

  /* =====================================================================
     MARQUEE com velocidade do scroll
     ===================================================================== */
  const marquees = [];
  let scrollVel = 0, scrollDir = 1;
  function makeMarquee(row, speed) {
    const inner = $(":scope > div", row);
    if (!inner) return;
    const m = { row, inner, items: [inner], speed, x: 0, w: 0, filled: false };
    const kids = [...inner.children];
    // mede só quando muda de tamanho (sem forçar layout a cada quadro)
    new ResizeObserver(() => {
      m.w = inner.offsetWidth;
      if (!m.w || m.filled) return;
      // completa a faixa até cobrir a tela e cria a cópia para o loop contínuo
      for (let k = 0; k < 6 && kids.length && inner.offsetWidth < window.innerWidth * 1.2; k++) kids.forEach((c) => inner.appendChild(c.cloneNode(true)));
      const clone = inner.cloneNode(true); clone.setAttribute("aria-hidden", "true");
      row.appendChild(clone);
      m.items.push(clone);
      m.w = inner.offsetWidth;
      m.filled = true;
    }).observe(inner);
    marquees.push(m);
  }
  function tickMarquees(dt) {
    const boost = Math.min(6, Math.abs(scrollVel) / 300);
    for (const m of marquees) {
      const wdt = m.w;
      if (!wdt || !m.filled) continue;
      m.x -= (m.speed * (1 + boost) * scrollDir) * dt;
      if (m.x <= -wdt) m.x += wdt;
      if (m.x > 0) m.x -= wdt;
      const t = `translate3d(${m.x.toFixed(1)}px,0,0)`;
      for (const it of m.items) it.style.transform = t;
    }
  }

  /* =====================================================================
     GSAP: PRELOADER + CENAS DE SCROLL
     ===================================================================== */
  function drawable(path) { const len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len; return len; }

  function heroIntro(smear) {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    const callPaths = $$(".scope__callouts path"), callCircles = $$(".scope__callouts circle");
    callPaths.forEach(drawable);
    gsap.set(callCircles, { scale: 0, transformOrigin: "50% 50%" });
    gsap.set(".callout-label", { opacity: 0 });

    tl.from(".hero__title .line > span", { yPercent: 115, rotate: 4, duration: 1.3, stagger: 0.11 }, 0)
      .from(".hero__wave--tr", { xPercent: 60, yPercent: -60, duration: 1.6, ease: "expo.out" }, 0)
      .from(".hero__wave--bl", { xPercent: -60, yPercent: 60, duration: 1.6, ease: "expo.out" }, 0.05)
      .from(".hero__top, .hero__bottom", { opacity: 0, duration: 1 }, 0.3)
      .from(".scope__dial", { rotate: -120, scale: 0.85, opacity: 0, duration: 1.8, ease: "expo.out", transformOrigin: "50% 50%" }, 0.05)
      .from(".scope__field", { scale: 0.6, opacity: 0, duration: 1.4, ease: "expo.out" }, 0.1)
      .fromTo(".smear", { filter: "blur(14px)" }, { filter: "blur(0px)", duration: 1.8, ease: "power2.inOut", clearProps: "filter" }, 0.3)
      .from(".scope__reticle", { opacity: 0, scale: 1.3, duration: 1.2, transformOrigin: "50% 50%" }, 0.6)
      .from(".hero__lead", { y: 30, opacity: 0, duration: 1 }, 0.55)
      .from(".hero__actions > *", { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.65)
      .from(".scope__tag, .scope__scale", { opacity: 0, y: 12, duration: 0.8, stagger: 0.12 }, 1.0);
    callCircles.forEach((c, i) => {
      const at = 1.25 + i * 0.28;
      tl.to(c, { scale: 1, duration: 0.6, ease: "back.out(2)" }, at)
        .to(callPaths[i], { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, at + 0.15)
        .to(`.callout-label--${i + 1}`, { opacity: 1, duration: 0.5 }, at + 0.5);
    });
    return tl;
  }

  function preloader(onReveal) {
    const pl = $(".preloader");
    // a animação de "foco" roda só na primeira visita da sessão
    const seen = root.classList.contains("intro-seen");
    try { sessionStorage.setItem("lapac-intro", "1"); } catch (e) { /* modo privado */ }
    if (!pl || seen) { pl?.remove(); lenis?.start(); onReveal(); return; }
    document.body.classList.add("is-loading");
    const ring = $(".preloader__ring circle"), img = $(".preloader__field img"), count = $(".preloader__count");
    const n = { v: 0 };
    gsap.set(".pp", { yPercent: 100 });
    const tl = gsap.timeline();
    tl.to(ring, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, 0)
      .to(img, { filter: "blur(0px)", opacity: 1, scale: 1, duration: 1, ease: "power2.inOut" }, 0)
      .to(n, { v: 100, duration: 1, ease: "power2.inOut", onUpdate: () => (count.textContent = pad(Math.round(n.v), 3)) }, 0)
      .to(".preloader__field", { scale: 0.92, duration: 0.25, ease: "power2.in" }, 1)
      .to(".pp", { yPercent: 0, duration: 0.6, stagger: 0.07, ease: "power4.inOut" }, 1.05)
      .set([".preloader__field", ".preloader__meta"], { autoAlpha: 0 }, 1.6)
      .set(pl, { backgroundColor: "transparent" }, 1.6)
      .add(() => onReveal(), 1.6)
      .to(".pp", { yPercent: -100, duration: 0.7, stagger: { each: 0.06, from: "end" }, ease: "power4.inOut" }, 1.62)
      .add(() => { pl.remove(); document.body.classList.remove("is-loading"); lenis?.start(); }, 2.45);
  }

  /* lâminas: montadas só com a página Áreas visível (seção escondida mede 0 e quebra o pin) */
  let slidesMM = null;
  function mountSlides() {
    if (!hasGsap || slidesMM) return;
    slidesMM = gsap.matchMedia();
    slidesMM.add("(min-width: 960px)", () => {
      const track = $(".slides__track");
      const count = $(".slides__count"), bar = $(".slides__bar span"), n = Math.max(1, $$(".slide").length);
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: ".slides", start: "top top", end: () => "+=" + dist(), pin: ".slides__pin", scrub: 0.9, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => { count.textContent = pad(Math.min(n, Math.floor(self.progress * n) + 1)); bar.style.transform = `scaleX(${Math.max(1 / n, self.progress)})`; },
        },
      });
      $$(".slide").forEach((s) => {
        gsap.fromTo($(".glass", s), { rotate: 3 }, { rotate: -2, ease: "none", scrollTrigger: { trigger: s, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        gsap.fromTo($(".specimen", s), { scale: 1.25, rotate: -8 }, { scale: 1, rotate: 0, ease: "none", scrollTrigger: { trigger: s, containerAnimation: tween, start: "left right", end: "center center", scrub: true } });
        gsap.from($$(".exams li", s), { x: 40, opacity: 0, stagger: 0.1, ease: "none", scrollTrigger: { trigger: s, containerAnimation: tween, start: "left 85%", end: "left 40%", scrub: true } });
      });
    });
    slidesMM.add("(max-width: 959px)", () => {
      gsap.from(".slide", { x: 80, opacity: 0, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".slides__viewport", start: "top 85%" } });
      $$(".slide").forEach((sl) => gsap.from($$(".exams li", sl), { x: 30, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: sl, start: "top 80%" } }));
    });

  }
  function unmountSlides() {
    if (!slidesMM) return;
    slidesMM.revert();
    slidesMM = null;
  }

  /* cenas globais (sempre visíveis): progresso, hero, faixas, rodapé */
  function initScenes() {
    // progresso de leitura
    gsap.to(".scroll-progress span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 } });

    // hero: parallax ao sair
    gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
      .to(".scope", { yPercent: 18, scale: 1.08, ease: "none" }, 0)
      .to(".scope__ticks", { rotation: 90, svgOrigin: "300 300", ease: "none" }, 0)
      .to(".hero__copy", { yPercent: -16, opacity: 0.2, ease: "none" }, 0)
      .to(".hero__wave--tr", { y: "-14vh", ease: "none" }, 0);

    // faixas e galeria: marquee reage à velocidade e skew
    $$(".ticker__row").forEach((row, i) => makeMarquee(row, i ? -60 : 60));
    $$(".film__row").forEach((row, i) => makeMarquee(row, i ? -40 : 40));
    const skewRows = $$(".ticker__row, .film__row");
    const skewTo = skewRows.map((r) => gsap.quickTo(r, "skewX", { duration: 0.5, ease: "power3" }));
    ST.create({
      trigger: document.body, start: "top top", end: "bottom bottom",
      onUpdate: (self) => {
        scrollVel = self.getVelocity(); scrollDir = self.direction;
        const sk = gsap.utils.clamp(-8, 8, scrollVel / -250);
        skewTo.forEach((fn) => fn(sk));
      },
    });
    gsap.ticker.add((time, deltaMS) => { tickMarquees(deltaMS / 1000); scrollVel *= 0.92; });

    // rodapé: LAPAC gigante sobe letra por letra
    gsap.from(".footer__word span", { yPercent: 100, duration: 1.4, stagger: 0.07, ease: "expo.out", scrollTrigger: { trigger: ".footer__word", start: "top 95%" } });
    gsap.from(".footer__wave", { xPercent: 50, yPercent: -50, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".footer", start: "top 80%" } });
    gsap.from(".footer__cta > *", { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".footer", start: "top 75%" } });
  }

  /* cenas de cada página: criadas só na primeira visita (o site abre mais rápido) */
  const SCENES = {
    home() {
      gsap.fromTo(".tile", { opacity: 0, y: 40, scale: 0.94, filter: "blur(8px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.9, stagger: { each: 0.06, grid: "auto", from: "start" }, ease: "power3.out", clearProps: "filter,transform", scrollTrigger: { trigger: ".hub__grid", start: "top 85%" } });
    },
    sobre() {
      gsap.from(".entry__senses li", { x: 40, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".entry", start: "top 75%" } });
      gsap.from(".entry__word", { yPercent: 100, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".entry", start: "top 80%" } });
    },
    identidade() {
      const spots = $$(".hotspot"), items = $$(".emblem-item");
      const activate = (i) => { spots.forEach((el) => el.classList.toggle("is-active", +el.dataset.spot === i)); items.forEach((it) => it.classList.toggle("is-active", +it.dataset.spot === i)); };
      items.forEach((it) => ST.create({ trigger: it, start: "top 62%", end: "bottom 62%", onToggle: (self) => self.isActive && activate(+it.dataset.spot) }));
      activate(0);
      gsap.fromTo(".emblem-map img", { rotate: -6, scale: 0.92 }, { rotate: 4, scale: 1, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });
    },
    missao() {
      gsap.from(".values li", { y: 24, opacity: 0, scale: 0.9, stagger: 0.06, duration: 0.7, ease: "back.out(1.6)", scrollTrigger: { trigger: ".values", start: "top 88%" } });
      gsap.from(".mvv__item", { y: 40, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".mvv", start: "top 85%" } });
    },
    equipe() {
      ST.batch(".tab-panel.is-active .person", { start: "top 90%", once: true, onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.08, ease: "power3.out", clearProps: "filter" }) });
    },
    atividades() {
      const cards = $$(".stack__card");
      cards.forEach((card, i) => {
        gsap.from($$(".stack__num b, .stack__body > *, .stack__art", card), { y: 50, opacity: 0, stagger: 0.08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 75%" } });
        gsap.from($(".stack__art", card), { rotate: -90, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "top top", scrub: true } });
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, { scale: 0.9, "--dim": 0.55, ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: true } });
      });
    },
    agenda() {
      ST.batch(".event", { start: "top 92%", onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }) });
    },
    selecao() {
      gsap.fromTo(".steps__path-fg", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".selection__steps", start: "top 70%", end: "bottom 60%", scrub: 0.6 } });
      $$(".steps li").forEach((li) => {
        ST.create({ trigger: li, start: "top 68%", onEnter: () => li.classList.add("is-on"), onLeaveBack: () => li.classList.remove("is-on") });
        gsap.from(li, { x: 40, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: li, start: "top 85%" } });
      });
      gsap.from(".report__list li", { opacity: 0, x: -20, stagger: 0.06, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: ".reports", start: "top 80%" } });
    },
    documentos() {
      ST.batch(".doc", { start: "top 90%", onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 60, rotate: (i) => (i % 2 ? 3 : -3) }, { opacity: 1, y: 0, rotate: 0, duration: 1.1, stagger: 0.1, ease: "power3.out" }) });
    },
    contato() {
      gsap.from(".contact__mail", { y: 40, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".contact__mail", start: "top 90%" } });
      gsap.from(".contact__form, .contact__info", { y: 60, opacity: 0, duration: 1.1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".contact", start: "top 85%" } });
    },
  };
  const scenesDone = new Set();
  function pageScenes(id) {
    if (!hasGsap || scenesDone.has(id)) return;
    scenesDone.add(id);
    const roots = $$(`[data-page="${id}"]`);
    const q = (sel) => roots.flatMap((r) => [...(r.matches(sel) ? [r] : []), ...$$(sel, r)]);
    q("[data-reveal-words]").forEach((el) => {
      gsap.from($$(".w-in", el), { yPercent: 115, rotate: 3, duration: 1.1, stagger: 0.06, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    q(".kicker").forEach((k) => gsap.from(k, { opacity: 0, x: -20, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: k, start: "top 90%" } }));
    const rev = q(".reveal");
    if (rev.length) ST.batch(rev, { start: "top 88%", onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out", overwrite: true }) });
    if (SCENES[id]) SCENES[id]();
  }

  /* conteúdo pesado só quando a página abre: amostras, galeria e mapa */
  function pageAssets(id) {
    if (id === "areas") paintSpecimens();
    if (id === "galeria") $$(".film__item img[data-spec]:not([src])").forEach((img) => { const [seed, kind, bg] = img.dataset.spec.split("|"); img.src = specimenURL(+seed, kind, { bg }); });
    if (id === "contato") { const m = $(".js-map"); if (m && !m.getAttribute("src") && m.dataset.src) m.src = m.dataset.src; }
  }

  function refreshIcons() { if (window.lucide?.createIcons) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } }); }

  /* =====================================================================
     BOOT
     ===================================================================== */
  renderAreas();
  renderEquipe();
  renderEventos();
  renderSelecao();
  renderGaleria();
  renderDocumentos();
  renderContato();
  initRouter(); // esconde as outras páginas antes de qualquer medição de layout
  buildDial();
  refreshIcons();
  $$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));

  // pathLength normalizado para o caminho da seleção
  $$(".steps__path path").forEach((p) => { p.setAttribute("pathLength", "1"); p.style.strokeDasharray = "1"; });
  $$(".steps__path-bg").forEach((p) => (p.style.strokeDasharray = "none"));

  const smear = initSmear();

  if (hasGsap) {
    if (window.Lenis && !reduceMotion) {
      lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on("scroll", ST.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
    }
    $$("[data-reveal-words]").forEach((el) => splitWords(el, maskWord));
    if (window.scrollY > 10) window.scrollTo(0, 0);
    preloader(() => heroIntro(smear));
    initScenes();
    document.fonts?.ready.then(() => ST.refresh());
    window.addEventListener("load", () => ST.refresh());
  } else {
    $(".preloader")?.remove();
    // faixas animadas mesmo sem GSAP (sem reduced motion)
    if (!reduceMotion) {
      $$(".ticker__row").forEach((row, i) => makeMarquee(row, i ? -50 : 50));
      $$(".film__row").forEach((row, i) => makeMarquee(row, i ? -35 : 35));
      let prev = performance.now();
      const loop = (now) => { tickMarquees(Math.min(0.05, (now - prev) / 1000)); prev = now; requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  initNav();
  initTabs();
  initEventFilter();
  initForm();
  initSlidesSwipeMeter();
  initCursor();
  initMagnetic();
})();
