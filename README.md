# SaaCare — Plateforme web

Site vitrine et parcours client/prestataire de SaaCare : mise en relation avec des
professionnels de confiance à domicile (garde d'enfants, chauffeur, soutien scolaire,
services à domicile) à Kinshasa, RDC.

Stack : **React 19 + Vite + Tailwind CSS v4**, animations avec **Motion** (ex-Framer Motion),
icônes **lucide-react**, SEO avec **react-helmet-async**.

## Démarrer en local

```bash
# Front
npm install

# API (dossier backend/)
cd backend && cp .env.example .env && npm install
npx prisma migrate dev
npm run db:seed
cd ..

# Front + API ensemble
npm run dev:all
```

- Site : http://localhost:5173  
- API : http://localhost:4000  

Comptes démo seedés :
- Client : `demo@saacare.com` / `demo1234` → `/espace-client`
- Prestataire : `prestataire@saacare.com` / `demo1234` → `/espace-prestataire`

Scripts utiles :

```bash
npm run dev        # front seul
npm run dev:api    # API seule
npm run db:seed    # recharger les prestataires / compte démo
```

## Build de production

```bash
npm run build    # génère le dossier dist/
npm run preview  # prévisualise le build de production
```

## Structure du projet

```
backend/              # API Express + Prisma + SQLite
├── prisma/           # Schéma, migrations, seed
└── src/              # Routes auth, contact, candidatures, prestataires
src/
├── components/
│   ├── layout/       # Navbar, Footer, transitions de page, skip link
│   ├── sections/      # Blocs réutilisés sur plusieurs pages (Hero, CTA, etc.)
│   └── ui/             # Composants atomiques (Button, Badge, ProviderCard, etc.)
├── data/               # Données mock / contenus éditoriaux
├── lib/                # SEO, API client, thème, animations
├── pages/              # Une page par route
└── index.css           # Design tokens Tailwind v4 (@theme), styles de base
```

## Ce qui est déjà implémenté

- **Routing complet** avec transitions animées entre pages (`react-router-dom` + `motion`)
- **Recherche de prestataires** avec filtres (domaine, commune, disponibilité, tri) — données mock côté client
- **Formulaire de réservation** (profil prestataire) et **candidature prestataire en 3 étapes**, avec états de succès
- **SEO** : balises meta par page, Open Graph, Twitter Card, JSON-LD (Organization, Service, FAQPage, Person), `sitemap.xml`, `robots.txt`, URLs canoniques
- **Accessibilité** : navigation clavier complète, focus visible, skip link, `aria-*` sur les composants interactifs, contrastes AA vérifiés (audit `axe-core` : 0 violation sur les 17 pages), respect de `prefers-reduced-motion`
- **Polices auto-hébergées** (`@fontsource`) : aucune requête vers un CDN externe
- **Design responsive** mobile → desktop, palette et typographie de marque dédiées (voir `src/index.css`)

## Backend (v1)

Le dossier [`backend/`](backend/README.md) expose une API REST :

- Auth JWT (`/api/auth/register`, `/login`, `/me`)
- Contact (`POST /api/contact`)
- Candidatures prestataire (`POST /api/applications`)
- Prestataires (`GET /api/providers`, `/api/providers/:id`)

Les formulaires Contact, Connexion/Inscription et Devenir prestataire sont branchés via le proxy Vite `/api` → `:4000`.

## Ce qui reste pour une mise en production réelle

- Espaces protégés client / prestataire / admin
- Passerelles de paiement (Mobile Money, carte) et séquestre
- Back-office (dispatching, litiges, reporting)
- Upload réel des pièces de candidature
- Réservations persistées et notifications e-mail/SMS

## Personnalisation rapide

- **Couleurs et polices** : `src/index.css` (bloc `@theme`)
- **Contenu des domaines / prestataires / avis / FAQ** : fichiers dans `src/data/`
- **Textes légaux** : `src/data/legal.js` (à faire relire par un juriste avant mise en ligne)
