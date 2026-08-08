export function notFound(_req, res) {
  res.status(404).json({ error: "Ressource introuvable." });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err?.name === "ZodError" || Array.isArray(err?.issues)) {
    const issues = err.issues ?? [];
    return res.status(400).json({
      error: issues[0]?.message || "Données invalides.",
      details: issues.map((issue) => ({
        path: Array.isArray(issue.path) ? issue.path.join(".") : String(issue.path ?? ""),
        message: issue.message,
      })),
    });
  }

  if (err?.code === "P2002") {
    return res.status(409).json({ error: "Cette ressource existe déjà." });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? "Erreur interne du serveur." : err.message,
  });
}
