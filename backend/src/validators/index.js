import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("E-mail invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  fullName: z.string().trim().min(2, "Le nom est requis."),
  role: z.enum(["CLIENT", "PROVIDER"]).optional().default("CLIENT"),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom est requis."),
  phone: z.string().trim().max(40).optional().default(""),
  commune: z.string().trim().max(80).optional().default(""),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis."),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string().min(1, "Confirmation requise."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis."),
  email: z.string().email("E-mail invalide."),
  subject: z.string().trim().min(2, "Le sujet est requis."),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères."),
});

export const applicationSchema = z.object({
  domain: z.string().trim().min(1, "Le domaine est requis."),
  specialties: z.array(z.string()).default([]),
  fullName: z.string().trim().min(2, "Le nom est requis."),
  phone: z.string().trim().min(8, "Le téléphone est requis."),
  commune: z.string().trim().min(2, "La commune est requise."),
  experience: z.string().trim().min(1, "L'expérience est requise."),
  languages: z.array(z.string()).default([]),
  motivation: z.string().trim().min(10, "Présentez-vous en quelques lignes."),
});

export function parseBody(schema, body) {
  return schema.parse(body);
}
