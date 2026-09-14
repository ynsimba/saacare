import { Router } from "express";
import prisma from "../lib/prisma.js";
import { parseBody, serviceRequestSchema, quoteRequestSchema, newsletterSchema } from "../validators/index.js";

const router = Router();

/** Numéro lisible communiqué au client, sans lien avec l'identifiant interne. */
function newReference(prefix) {
  const year = String(new Date().getFullYear()).slice(-2);
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${year}-${suffix}`;
}

// POST /api/requests — demande client, statut « Nouvelle » (cahier des charges §3.1)
router.post("/requests", async (req, res, next) => {
  try {
    const { service, commune, frequency, firstName, phone, email, providerReference, ...details } = parseBody(
      serviceRequestSchema,
      req.body
    );
    const row = await prisma.serviceRequest.create({
      data: {
        reference: newReference("DEM"),
        service,
        commune,
        frequency,
        firstName,
        phone,
        email,
        providerReference,
        details: JSON.stringify(details),
      },
    });
    res.status(201).json({ reference: row.reference });
  } catch (err) {
    next(err);
  }
});

// POST /api/quotes/request — demande de devis entreprise, statut « Devis à établir » (§3.3)
router.post("/quotes/request", async (req, res, next) => {
  try {
    const { company, contactName, phone, email, ...details } = parseBody(quoteRequestSchema, req.body);
    const row = await prisma.serviceRequest.create({
      data: {
        reference: newReference("DEV"),
        kind: "QUOTE",
        status: "DEVIS_A_ETABLIR",
        service: details.needType,
        firstName: contactName,
        phone,
        email,
        details: JSON.stringify({ company, ...details }),
      },
    });
    res.status(201).json({ reference: row.reference });
  } catch (err) {
    next(err);
  }
});

// POST /api/newsletter — inscription avec consentement explicite (double confirmation à brancher)
router.post("/newsletter", async (req, res, next) => {
  try {
    const { email } = parseBody(newsletterSchema, req.body);
    await prisma.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email } });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
