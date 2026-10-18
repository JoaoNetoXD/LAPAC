// POST { pasta: "equipe"|"galeria"|"docs", nome, base64 } -> { path }
// Cada arquivo recebe um nome novo (com data/hora), então nunca sobrescreve outro.
const { guard, fail, putFile } = require("./_lib");

const FOLDERS = {
  equipe: { dir: "assets/img/equipe", ext: ["webp", "jpg", "jpeg", "png"] },
  galeria: { dir: "assets/img/galeria", ext: ["webp", "jpg", "jpeg", "png"] },
  docs: { dir: "docs", ext: ["pdf"] },
};
const MAX_BYTES = 3.2 * 1024 * 1024; // limite da Vercel é ~4,5 MB por envio (base64 aumenta ~33%)

const slug = (s) => String(s || "arquivo").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "arquivo";

module.exports = async (req, res) => {
  if (!guard(req, res, "POST")) return;
  const { pasta, nome, base64 } = req.body || {};
  const f = FOLDERS[pasta];
  if (!f || typeof base64 !== "string") return fail(res, 400, "Envio inválido.");
  const ext = String(nome || "").split(".").pop().toLowerCase();
  if (!f.ext.includes(ext)) return fail(res, 400, `Tipo de arquivo não aceito aqui (use ${f.ext.join(", ")}).`);
  const bytes = Buffer.from(base64, "base64");
  if (!bytes.length) return fail(res, 400, "Arquivo vazio.");
  if (bytes.length > MAX_BYTES) return fail(res, 413, "Arquivo grande demais (máx. 3 MB). Comprima o PDF e tente de novo.");
  // confere a "assinatura" do arquivo
  const head = bytes.subarray(0, 12).toString("latin1");
  const okSig = ext === "pdf" ? head.startsWith("%PDF") : ext === "png" ? head.startsWith("\x89PNG") : ext === "webp" ? head.slice(8, 12) === "WEBP" : head.startsWith("\xff\xd8");
  if (!okSig) return fail(res, 400, "O arquivo parece corrompido ou não é do tipo informado.");

  const base = slug(String(nome).replace(/\.[^.]+$/, ""));
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const path = `${f.dir}/${base}-${stamp}.${ext === "jpeg" ? "jpg" : ext}`;
  try {
    await putFile(path, bytes.toString("base64"), `arquivo: ${path} [painel]`);
    res.status(200).json({ ok: true, path });
  } catch (e) {
    fail(res, 502, `Não foi possível enviar o arquivo: ${e.message}`);
  }
};
