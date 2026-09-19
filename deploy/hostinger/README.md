# Déploiement Hostinger — app.saacare.com + api.saacare.com

## Architecture & routes

| URL | Rôle | Routage |
|-----|------|---------|
| https://app.saacare.com/* | PWA React | `.htaccess` → `index.html` (React Router) |
| https://api.saacare.com/api/* | API Laravel | `public/index.php` |
| https://api.saacare.com/ | Santé JSON | `routes/web.php` |
| https://saacare.com/* | Redirection | → `https://app.saacare.com/...` |

Fichiers :

- `public/.htaccess` — embarqué dans `npm run build` → `dist/.htaccess` (PWA)
- `deploy/hostinger/apex-redirect.htaccess` — pour le domaine racine
- `backend/public/.htaccess` — Laravel (déjà fourni)

## 1. Sous-domaines (hPanel)

1. **`app`** → document root = dossier de la PWA (ex. `domains/app.saacare.com/public_html`)
2. **`api`** → document root = `laravel/public`
3. SSL sur `app` et `api`
4. (Optionnel) `saacare.com` / `www` : coller `apex-redirect.htaccess` en `.htaccess`

## 2. API (`api.saacare.com`)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.saacare.com
FRONTEND_URL=https://app.saacare.com
SANCTUM_STATEFUL_DOMAINS=app.saacare.com
```

```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
```

Tests :
- https://api.saacare.com/ → JSON service
- https://api.saacare.com/api/health → `{"ok":true}`

## 3. PWA (`app.saacare.com`)

```env
VITE_API_BASE=https://api.saacare.com
```

```bash
npm ci && npm run build
```

Uploader **tout** le contenu de `dist/` (y compris `.htaccess`) dans le document root de `app`.

Vérifier qu’un deep link fonctionne sans 404 Apache :
- https://app.saacare.com/login
- https://app.saacare.com/admin/dashboard
- https://app.saacare.com/prestataire/missions

(Sans le `.htaccess` SPA, Apache renvoie 404 sur ces URLs en refresh.)

## 4. Routes React (rappel)

Gérées côté client dans `src/App.jsx` (`BrowserRouter`).  
En production, Apache doit toujours servir `index.html` pour les chemins non-fichiers — c’est le rôle de `public/.htaccess`.
