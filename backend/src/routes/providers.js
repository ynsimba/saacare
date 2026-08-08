import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

function serializeProvider(row) {
  return {
    id: row.id,
    name: row.name,
    domainSlug: row.domainSlug,
    role: row.role,
    commune: row.commune,
    rating: row.rating,
    reviews: row.reviews,
    experience: row.experience,
    priceFrom: row.priceFrom,
    languages: JSON.parse(row.languages),
    badges: JSON.parse(row.badges),
    bio: row.bio,
    initials: row.initials,
    topRated: row.topRated,
    availability: row.availability,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const { domaine, commune } = req.query;
    const where = {};

    if (typeof domaine === "string" && domaine.trim()) {
      where.domainSlug = domaine.trim();
    }
    if (typeof commune === "string" && commune.trim()) {
      where.commune = { contains: commune.trim() };
    }

    const rows = await prisma.provider.findMany({
      where,
      orderBy: [{ topRated: "desc" }, { rating: "desc" }],
    });

    res.json({ providers: rows.map(serializeProvider) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const row = await prisma.provider.findUnique({ where: { id: req.params.id } });
    if (!row) {
      return res.status(404).json({ error: "Prestataire introuvable." });
    }
    res.json({ provider: serializeProvider(row) });
  } catch (err) {
    next(err);
  }
});

export default router;
