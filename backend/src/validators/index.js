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

const optionalText = (max) => z.string().trim().max(max).optional().default("");

export const serviceRequestSchema = z.object({
  service: z.string().trim().min(1, "Choisissez un service."),
  commune: z.string().trim().min(2, "Choisissez une commune."),
  frequency: z.string().trim().min(1, "Choisissez une fréquence."),
  date: optionalText(20),
  dueDate: optionalText(20),
  firstName: z.string().trim().min(2, "Indiquez votre prénom."),
  phone: z.string().trim().min(8, "Indiquez un numéro de téléphone valide."),
  email: z.union([z.literal(""), z.string().trim().email("Courriel invalide.")]).optional().default(""),
  address: optionalText(300),
  need: optionalText(2000),
  providerReference: optionalText(40),
});

export const quoteRequestSchema = z.object({
  company: z.string().trim().min(2, "Indiquez la raison sociale."),
  contactName: z.string().trim().min(2, "Indiquez le nom du contact."),
  phone: z.string().trim().min(8, "Indiquez un numéro de téléphone valide."),
  email: z.string().trim().email("Courriel invalide."),
  needType: z.string().trim().min(1, "Choisissez le type de besoin."),
  positions: z
    .array(z.object({ metier: z.string().trim().min(1), count: z.coerce.number().int().min(1).max(500) }))
    .min(1, "Ajoutez au moins un poste."),
  duration: optionalText(80),
  location: optionalText(200),
  startDate: optionalText(20),
  message: optionalText(2000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("Courriel invalide."),
  consent: z.boolean().refine((v) => v === true, "Le consentement est requis."),
});
