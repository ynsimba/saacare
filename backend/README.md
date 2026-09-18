# SaaCare API (Laravel)

## Prérequis

- PHP 8.2+
- Composer
- MySQL via **MAMP** (phpMyAdmin : `http://localhost:8888/phpMyAdmin5/`) — port MySQL **8889**, user `root` / `root`
- (optionnel) Docker MySQL : `docker compose up -d` puis `DB_PORT=3306`, user `saacare` / `saacare`

## Configuration

```bash
cp .env.example .env
php artisan key:generate
# Vérifier DB_PORT=8889 (MAMP) et GOOGLE_CLIENT_*
php artisan migrate --seed
php artisan serve --port=8001
```

Dans phpMyAdmin, la base **saacare** doit apparaître après migrate.
## Comptes démo (mot de passe `demo1234`)

| Email | Rôle |
|-------|------|
| admin@saacare.cd | admin |
| client@saacare.cd | client |
| prestataire@saacare.cd | prestataire (approved) |
| prestataire.pending@saacare.cd | prestataire (pending) |

## Comptes admin équipe (mot de passe initial `Saacare@2026`)

| Email | Nom |
|-------|-----|
| bellezajohncy@saacare.com | Belleza Johncy |
| sephorasoki@saacare.com | Sephora Soki |
| yvesnsimba@saacare.com | Yves Nsimba (**super-admin**) |

Modules super-admin : Utilisateurs, Journal connexions, Comptabilité, Statistiques, Données (backup / purge).

## Agenda & rappels e-mail

Les admins créent des rendez-vous depuis le calendrier du tableau de bord. Les rappels partent via :

```bash
php artisan schedule:work
# ou cron : * * * * * php /path/to/artisan schedule:run
```

Avec `MAIL_MAILER=log`, les e-mails sont écrits dans `storage/logs/laravel.log`. Pour la prod, configurer SMTP (`MAIL_*`).
