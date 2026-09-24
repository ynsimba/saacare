# Déploiement Hostinger — www.saacare.com + api.saacare.com

## Architecture

| URL | Rôle |
|-----|------|
| https://www.saacare.com/* | PWA React (`public_html/`) |
| https://saacare.com/* | Redirige → `www.saacare.com` |
| https://api.saacare.com/* | API Laravel (`public_html/api/backend/public`) |
| https://app.saacare.com/* | Redirige → `www.saacare.com` (ancien sous-domaine) |

## API

```env
APP_URL=https://api.saacare.com
FRONTEND_URL=https://www.saacare.com
SANCTUM_STATEFUL_DOMAINS=www.saacare.com,saacare.com
```

## PWA

```env
VITE_API_BASE=https://api.saacare.com
```

`npm run build` → uploader le contenu de `dist/` dans **`public_html/`** (racine),
**sans supprimer** les dossiers `api/` et `app/`.

Le `.htaccess` SPA ignore `/api` et `/app`.
