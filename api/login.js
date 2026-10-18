const { configured, passwordOk, newSession, fail } = require("./_lib");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return fail(res, 405, "Método não permitido.");
  if (!configured()) return fail(res, 503, "Painel ainda não configurado na Vercel (ADMIN_PASSWORD / GITHUB_TOKEN).");
  const { password } = req.body || {};
  if (!passwordOk(password)) {
    await new Promise((r) => setTimeout(r, 800)); // freia tentativas repetidas
    return fail(res, 401, "Senha incorreta.");
  }
  res.status(200).json({ ok: true, token: newSession() });
};
