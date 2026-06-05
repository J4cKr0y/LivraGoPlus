# 📦 LivraGoPlus

LivraGoPlus est une application mobile robuste conçue pour les chauffeurs-livreurs. 
Elle simplifie la gestion des tournées grâce à l'OCR, l'optimisation de trajet et l'automatisation des notifications clients, le tout avec une approche **Offline-First**.

---

## 🚀 Vision du Projet

L'objectif est d'offrir un outil fiable qui fonctionne même dans les zones blanches (zones sans réseau) :

- **Scan & Go** : Extraction d'adresses via OCR avec support de saisie manuelle et galerie.
- **Offline-First** : Persistance locale via SQLite (Expo-SQLite) avec synchronisation automatique en arrière-plan.
- **Optimisation** : Algorithmes de tri de tournée pour réduire les kilomètres parcourus.
- **Cloud Sync** : Sauvegarde sécurisée des preuves de livraison (photos) sur Convex.
- **Proximité Intelligente** : Envoi automatique de SMS à l'approche de la destination.

---

## 🏗️ Architecture & Principes

Le projet suit une **Architecture Hexagonale (Ports & Adapters)** découpée par **Features**.

- **Core (Domain/Services)** : Contient la logique métier pure, sans dépendance aux frameworks (React Native, Google, etc.).
- **Infrastructure (Adapters)** : Implémentations concrètes des interfaces (OCR, Storage, Maps). Permet de changer de fournisseur facilement.
- **Features** : Découpage par domaine fonctionnel (ex: deliveries, tracking).
- **Synchronisation** : Moteur de rattrapage automatique (SyncService) réagissant aux changements de réseau.
- **TDD (Chicago Style)** : Tests portés sur le comportement et l'état final, garantissant une robustesse maximale lors des refactorings.

---

## 🛠️ Stack Technique

| Technologie | Usage |
|------------|-------|
| React Native / Expo | Framework Cross-platform |
| TypeScript | Typage statique pour la sécurité logicielle |
| Jest / Testing Library | Tests unitaires et d'intégration (TDD) |
| SQLite (Expo) | Persistance Offline et cache local |
| Convex | Backend Cloud (DB, Auth, Storage) |
| React Navigation | Gestion des flux d'écrans |
| Zustand / TanStack Query | Gestion d'état et cache (prévu) |

---

## 📂 Structure du code

```
src/
├── core/               # Le Cœur (Logique métier pure)
│   ├── domain/         # Entités (Delivery, Address)
│   ├── interfaces/     # Contrats (IOcrService, IDeliveryRepository)
│   ├── services/       # Use Cases (DeliveryService)
│   └── di/             # Injection de dépendances
├── infrastructure/     # Implémentations techniques (Adapters)
│   ├── storage/        # SQLite, InMemory
│   └── ocr/            # MLKit, FakeOCR
├── features/           # Écrans et composants par fonctionnalité
│   └── deliveries/     # Gestion des livraisons
└── navigation/         # Configuration des routes
└── convex/             # Backend Convex (mutations & actions)
```

---

## 🛠️ Installation & Tests

### 1. Installation des dépendances

```bash
npm install
```

### 2. Lancer les tests (TDD)

```bash
npm test          # Lancer tous les tests
npm test --watch  # Mode développement
```

---

## 🗺️ Roadmap de développement

- [x] Initialisation de l'architecture Core/Domain.
- [x] Implémentation du Scan OCR et flux de validation.
- [x] Gestion d'état avec Zustand et Optimistic UI.
- [x] Persistance SQLite Offline-First.
- [x] Moteur de synchronisation arrière-plan (SyncService).
- [x] Intégration du Storage Convex pour les preuves de livraison.
- [ ] Cartographie avancée (Mapbox/Google Maps).
- [ ] Géolocalisation en arrière-plan.

---

## 📝 Note de développement

Le projet a toujours privilégié une implémentation **"Fake"** ou **"In-Memory"** testée avant de passer à l'implémentation native finale. 
Le projet suit une stratégie Offline-First stricte : toute donnée validée est immédiatement persistée en local. 
La synchronisation avec le cloud (Convex) est traitée de manière asynchrone pour garantir une expérience utilisateur fluide, même en mode dégradé.

