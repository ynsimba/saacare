# SaaCare — Plateforme web

Site vitrine et espaces client / prestataire / admin de SaaCare : mise en relation
avec des professionnels de confiance à domicile (garde d'enfants, chauffeur,
soutien scolaire, services à domicile) à Kinshasa, RDC.

Stack : **React 19 + Vite + Tailwind CSS v4** (front), **Laravel + MySQL** (API).

## Démarrer en local

```bash
# Front
npm install

# API
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8001
cd ..

# Front + API ensemble
npm run dev:all
```

- Site : http://localhost:5173  
- API : http://localhost:8001  

Comptes démo (mot de passe `demo1234`) :

| Email | Rôle |
|-------|------|
| admin@saacare.cd | admin |
| client@saacare.cd | client |
| prestataire@saacare.cd | prestataire |

Scripts utiles :

```bash
npm run dev        # front seul
npm run dev:api    # API Laravel seule
npm run db:migrate # migrations
npm run db:seed    # seed
```

## Build de production

```bash
npm run build    # génère le dossier dist/
npm run preview  # prévisualise le build
```

## Structure

```
backend/              # API Laravel (Sanctum, MySQL)
src/                  # Front React
├── components/
├── data/
├── lib/
└── pages/
```

Voir aussi [`backend/README.md`](backend/README.md) pour la configuration MySQL / MAMP.
