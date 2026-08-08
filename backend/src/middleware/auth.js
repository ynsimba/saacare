import jwt from "jsonwebtoken";
import config from "../config.js";
import prisma from "../lib/prisma.js";
import { publicUserSelect } from "../lib/publicUser.js";

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret);
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Jeton invalide ou expiré." });
  }
}

export async function attachUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
      select: publicUserSelect,
    });
    if (!user) {
      return res.status(401).json({ error: "Utilisateur introuvable." });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
