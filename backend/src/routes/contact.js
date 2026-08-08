import { Router } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { contactSchema, parseBody } from "../validators/index.js";

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de messages envoyés. Réessayez plus tard." },
});

router.post("/", contactLimiter, async (req, res, next) => {
  try {
    const data = parseBody(contactSchema, req.body);
    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        subject: data.subject,
        message: data.message,
      },
    });
    res.status(201).json({
      id: message.id,
      message: "Message reçu. Notre équipe vous répond sous 24 heures ouvrées.",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
