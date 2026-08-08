import { Router } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { applicationSchema, parseBody } from "../validators/index.js";

const router = Router();

const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de candidatures. Réessayez plus tard." },
});

router.post("/", applicationLimiter, async (req, res, next) => {
  try {
    const data = parseBody(applicationSchema, req.body);
    const application = await prisma.providerApplication.create({
      data: {
        domain: data.domain,
        specialties: JSON.stringify(data.specialties),
        fullName: data.fullName,
        phone: data.phone,
        commune: data.commune,
        experience: data.experience,
        languages: JSON.stringify(data.languages),
        motivation: data.motivation,
      },
    });

    res.status(201).json({
      id: application.id,
      status: application.status,
      message: "Candidature envoyée. Notre équipe qualité examine votre dossier.",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
