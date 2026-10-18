// Funções compartilhadas do painel admin (Vercel Serverless, Node 18+).
// Variáveis de ambiente (configurar no painel da Vercel):
//   ADMIN_PASSWORD  senha do painel
//   GITHUB_TOKEN    token do GitHub com permissão "Contents: Read and write" no repositório
//   GITHUB_REPO     opcional, padrão "JoaoNetoXD/LAPAC"
//   GITHUB_BRANCH   opcional, padrão "main"
const crypto = require("crypto");

const REPO = process.env.GITHUB_REPO || "JoaoNetoXD/LAPAC";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const API = process.env.GITHUB_API || "https://api.github.com";
const DATA_PATH = "assets/js/data.js";
const SESSION_HOURS = 12;

function configured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.GITHUB_TOKEN);
}

function secret() {
  return process.env.SESSION_SECRET ||
    crypto.createHash("sha256").update(`${process.env.ADMIN_PASSWORD}|${process.env.GITHUB_TOKEN}`).digest("hex");
}

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

function sign(payload) {
  const body = b64url(JSON.stringify(payload));
  const mac = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  return `${body}.${mac}`;
}

function verify(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [body, mac] = token.split(".");
  const expected = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  const a = Buffer.from(mac), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const p = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    return p.exp > Date.now();
  } catch { return false; }
}

function passwordOk(pw) {
  const a = crypto.createHash("sha256").update(String(pw || "")).digest();
  const b = crypto.createHash("sha256").update(String(process.env.ADMIN_PASSWORD || "")).digest();
  return crypto.timingSafeEqual(a, b);
}

function newSession() {
  return sign({ exp: Date.now() + SESSION_HOURS * 3600e3 });
}

/** responde erro padronizado */
function fail(res, status, message) {
  res.status(status).json({ ok: false, error: message });
}

/** exige configuração + sessão válida; devolve true se pode seguir */
function guard(req, res, method) {
  res.setHeader("Cache-Control", "no-store");
  if (method && req.method !== method) { fail(res, 405, "Método não permitido."); return false; }
  if (!configured()) { fail(res, 503, "Painel ainda não configurado na Vercel (ADMIN_PASSWORD / GITHUB_TOKEN)."); return false; }
  const auth = req.headers.authorization || "";
  if (!verify(auth.replace(/^Bearer\s+/i, ""))) { fail(res, 401, "Sessão expirada. Entre novamente."); return false; }
  return true;
}

async function gh(path, opts = {}) {
  const r = await fetch(`${API}/repos/${REPO}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "lapac-admin",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const text = await r.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* resposta não-JSON */ }
  if (!r.ok) {
    const err = new Error((json && json.message) || `GitHub respondeu ${r.status}`);
    err.status = r.status;
    throw err;
  }
  return json;
}

async function getFile(path) {
  const j = await gh(`/contents/${encodeURI(path)}?ref=${BRANCH}`);
  return { sha: j.sha, content: Buffer.from(j.content, "base64").toString("utf8") };
}

async function putFile(path, base64, message, sha) {
  return gh(`/contents/${encodeURI(path)}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: base64, branch: BRANCH, ...(sha ? { sha } : {}) }),
  });
}

function parseData(source) {
  const start = source.indexOf("{", source.indexOf("window.LAPAC"));
  const end = source.lastIndexOf("}");
  return JSON.parse(source.slice(start, end + 1));
}

function serializeData(data) {
  return `/* LAPAC — conteúdo do site.
   Edite pelo painel: https://lapac-ufpi.vercel.app/admin
   (este arquivo é regravado pelo painel; mantenha o formato JSON abaixo) */
window.LAPAC = ${JSON.stringify(data, null, 2)};
`;
}

module.exports = { configured, passwordOk, newSession, guard, fail, getFile, putFile, parseData, serializeData, DATA_PATH, REPO, BRANCH };
