# SaaCare API

Backend Node.js (Express + Prisma + SQLite) pour la plateforme SaaCare.

## Prérequis

- Node.js 20+
- npm

## Installation

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
```

## Démarrer

```bash
npm run dev
```

API disponible sur `http://localhost:4000`.

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Santé |
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion (JWT) |
| GET | `/api/auth/me` | Profil (Bearer) |
| POST | `/api/contact` | Message contact |
| POST | `/api/applications` | Candidature prestataire |
| GET | `/api/providers` | Liste (`?domaine=&commune=`) |
| GET | `/api/providers/:id` | Détail |

## Comptes démo (seed)

| Rôle | E-mail | Mot de passe |
|------|--------|--------------|
| Client | `demo@saacare.com` | `demo1234` |
| Prestataire | `prestataire@saacare.com` | `demo1234` |
