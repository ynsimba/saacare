import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { publicUserSelect, toPublicUser } from "../lib/publicUser.js";
import { attachUser, requireAuth, signToken } from "../middleware/auth.js";
import { loginSchema, parseBody, passwordSchema, profileSchema, registerSchema } from "../validators/index.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives. Réessayez plus tard." },
});

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const data = parseBody(registerSchema, req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet e-mail." });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.fullName,
        role: data.role,
      },
      select: publicUserSelect,
    });

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const data = parseBody(loginSchema, req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: "E-mail ou mot de passe incorrect." });
    }

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "E-mail ou mot de passe incorrect." });
    }

    const safeUser = toPublicUser(user);
    const token = signToken(safeUser);
    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, attachUser, (req, res) => {
  res.json({ user: req.user });
});

router.patch("/me", requireAuth, attachUser, async (req, res, next) => {
  try {
    const data = parseBody(profileSchema, req.body);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: data.fullName,
        phone: data.phone ?? "",
        commune: data.commune ?? "",
      },
      select: publicUserSelect,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch("/me/password", requireAuth, attachUser, async (req, res, next) => {
  try {
    const data = parseBody(passwordSchema, req.body);
    const full = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!full) {
      return res.status(401).json({ error: "Utilisateur introuvable." });
    }

    const ok = await bcrypt.compare(data.currentPassword, full.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: "Mot de passe actuel incorrect." });
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
