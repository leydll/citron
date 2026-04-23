# Citron — application web conteneurisée (Frontend + Backend) avec CI/CD

## Description

Ce projet fournit une application web simple, conçue pour être **conteneurisée**, **testée automatiquement**, puis **déployée** dans un cluster Kubernetes (K3s/Minikube).

Fonctionnalités principales :

- Backend **Node.js / Express** avec un endpoint de santé `GET /health` (200 OK)
- Frontend **statique** servi par **Nginx**, qui affiche un message obtenu depuis le backend
- Orchestration locale via **Docker Compose**
- Déploiement Kubernetes via manifests dans `k8s/`
- Pipeline CI/CD **GitHub Actions** : tests → build & push Docker Hub → déploiement sur VM via SSH

## Architecture

### Backend (`backend/`)

- **Express**
- Endpoints:
  - `GET /health` → `200 OK` + corps `OK`
  - `GET /message` → JSON `{ "message": "..." }`

### Frontend (`frontend/`)

- **Nginx** sert `index.html` et `app.js`
- Reverse-proxy :
  - Le frontend appelle l’API via `/api/*`
  - Nginx proxyfie `/api/health` → backend `/health` et `/api/message` → backend `/message`
- Variables d’environnement utilisées par l’image frontend:
  - `BACKEND_HOST` (nom DNS du service backend)
  - `BACKEND_PORT` (port HTTP du backend)

### Conteneurs et images

- Backend : `mon-user-docker/mon-app-back:latest` (exemple)
- Frontend : `mon-user-docker/mon-app-front:latest` (exemple)

Les `Dockerfile` des deux services utilisent **multi-stage build**.

## Exécution en local (Docker Compose)

### Prérequis

- Docker + Docker Compose

### Démarrage

```bash
cp .env.example .env
docker compose up --build
```

### URLs

- Frontend: `http://localhost:${FRONTEND_PORT}`
- Backend health (interne) via proxy frontend: `http://localhost:${FRONTEND_PORT}/api/health`
- Backend message via proxy frontend: `http://localhost:${FRONTEND_PORT}/api/message`

## Déploiement Kubernetes (K3s/Minikube)

Les manifests Kubernetes sont dans `k8s/` et incluent:

- `ConfigMap` (`citron-config`) pour `BACKEND_HOST` et `BACKEND_PORT`
- Déploiements + Services pour backend et frontend
- Service frontend en **NodePort** (par défaut `30080`) pour accès depuis l’IP publique d’une VM

### Appliquer les manifests

Sur la machine qui a accès au cluster (souvent la VM K3s):

```bash
kubectl apply -f k8s/
```

Accès (NodePort):

- `http://IP_PUBLIQUE_VM:30080`

## Pipeline CI/CD (GitHub Actions)

Le workflow se trouve dans `.github/workflows/deploy.yml` et s’exécute à **chaque push sur `main`**.

### Objectif

Pipeline **100% automatisé**:

- Échec immédiat si les **tests** échouent
- Build des images Docker
- Push des images vers Docker Hub
- Déploiement sur une VM via SSH
- Mise à jour Kubernetes en appliquant `k8s/` puis redémarrage des pods

### Étapes détaillées

1) **Checkout du code**
   - Récupération du dépôt sur le runner GitHub.

2) **Installation des dépendances**
   - Installation côté backend via `npm ci` (basé sur `backend/package-lock.json`).

3) **Tests**
   - Exécution de `npm test` (tests unitaires Node `--test`).
   - Si un test échoue, le pipeline s’arrête (pas de build/push/deploy).

4) **Build des images Docker (frontend + backend)**
   - Construction des images à partir des `Dockerfile` multi-stage.

5) **Push sur Docker Hub**
   - Authentification via secrets GitHub:
     - `DOCKER_USERNAME`
     - `DOCKER_PASSWORD`
   - Push de deux tags:
     - `:latest`
     - `:${GITHUB_SHA}` (traçabilité)

6) **Déploiement sur VM via SSH**
   - Connexion SSH via `appleboy/ssh-action` avec:
     - `VM_SSH_HOST`
     - `VM_SSH_USER`
     - `VM_SSH_KEY`
   - Sur la VM:
     - Synchronisation du repo (clone si absent, sinon reset sur `origin/main`)
     - `kubectl apply -f k8s/`
     - `kubectl rollout restart` des déploiements frontend et backend
     - Attente de disponibilité via `kubectl rollout status`

### Secrets GitHub requis

Configurer dans GitHub (Settings → Secrets and variables → Actions) :

- **Docker Hub**
  - `DOCKER_USERNAME`
  - `DOCKER_PASSWORD`
- **VM**
  - `VM_SSH_HOST`
  - `VM_SSH_USER`
  - `VM_SSH_KEY` (clé privée SSH)

## Déploiement depuis zéro (guide complet)

### 1) Préparer la VM (K3s)

Sur la VM:

- Installer K3s (si ce n’est pas déjà fait)
- Vérifier l’accès au cluster:

```bash
sudo k3s kubectl get nodes
```

Option alternative:

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get nodes
```

### 2) Préparer Docker Hub

- Créer un compte Docker Hub
- Créer/choisir les repositories d’images:
  - `mon-user-docker/mon-app-back`
  - `mon-user-docker/mon-app-front`

### 3) Mettre à jour les images dans Kubernetes

Dans `k8s/backend-deployment.yaml` et `k8s/frontend-deployment.yaml`, remplacer les images génériques par les tiennes (ou conserver celles déjà utilisées si elles correspondent).

### 4) Configurer les secrets GitHub Actions

Ajouter les secrets requis (voir section “Secrets GitHub requis”).

### 5) Déclencher le pipeline

À chaque push sur `main`, GitHub Actions:

- lance les tests
- build et push les images
- se connecte à la VM
- applique `k8s/` et redémarre les pods

### 6) Vérifier le déploiement

Sur la VM:

```bash
kubectl get pods
kubectl get svc
```

Depuis l’extérieur:

- `http://IP_PUBLIQUE_VM:30080`

## Difficultés rencontrées


