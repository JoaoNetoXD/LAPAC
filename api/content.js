// GET  -> conteúdo atual (lido do GitHub, então já reflete a última publicação)
// POST -> grava o conteúdo novo { data, sha }
const { guard, fail, getFile, putFile, parseData, serializeData, DATA_PATH } = require("./_lib");

const REQUIRED = ["contato", "areas", "selecao", "orientadores", "diretoria", "membros", "eventos", "galeria", "documentos"];

module.exports = async (req, res) => {
  if (!["GET", "POST"].includes(req.method)) return fail(res, 405, "Método não permitido.");
  if (!guard(req, res)) return;
  try {
    if (req.method === "GET") {
      const f = await getFile(DATA_PATH);
      return res.status(200).json({ ok: true, sha: f.sha, data: parseData(f.content) });
    }
    const { data, sha, resumo } = req.body || {};
    if (!data || typeof data !== "object" || REQUIRED.some((k) => !(k in data))) return fail(res, 400, "Conteúdo inválido.");
    const text = serializeData(data);
    if (text.length > 400000) return fail(res, 413, "Conteúdo grande demais.");
    const msg = `conteúdo: ${String(resumo || "atualização pelo painel").slice(0, 80)} [painel]`;
    const r = await putFile(DATA_PATH, Buffer.from(text, "utf8").toString("base64"), msg, sha);
    res.status(200).json({ ok: true, sha: r.content.sha });
  } catch (e) {
    if (e.status === 409 || e.status === 422) return fail(res, 409, "Alguém publicou uma alteração enquanto você editava. Recarregue o painel e refaça a mudança.");
    fail(res, 502, `Não foi possível falar com o GitHub: ${e.message}`);
  }
};
