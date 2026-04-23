# Citron — app web conteneurisée (frontend + backend)

## Prérequis

- Docker + Docker Compose

## Démarrage

1) Créer votre fichier d’environnement:

```bash
cp .env.example .env
```

2) Lancer:

```bash
docker compose up --build
```

## URLs

- Frontend: `http://localhost:${FRONTEND_PORT}`
- Health backend (direct): `http://localhost:${BACKEND_PORT}/health`
- API via proxy (depuis le frontend): `/api/health` et `/api/message`

