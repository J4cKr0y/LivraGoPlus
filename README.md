# 📦 LivraGoPlus

LivraGoPlus est une application mobile robuste conçue pour les chauffeurs-livreurs. 
Elle simplifie la gestion des tournées grâce à l'OCR, l'optimisation de trajet et l'automatisation des notifications clients, le tout avec une approche **Offline-First**.

---

## 🚀 Vision du Projet

L'objectif est d'offrir un outil fiable qui fonctionne même dans les zones blanches (zones sans réseau) :

- **Scan & Go** : Extraction d'adresses et numéros via OCR local.
- **Optimisation** : Calcul de la trajectoire la plus appropriée.
- **Proximité Intelligente** : Envoi automatique de SMS à l'approche de la destination.

---

## 🏗️ Architecture & Principes

Le projet suit une **Architecture Hexagonale (Ports & Adapters)** découpée par **Features**.

- **Core (Domain/Services)** : Contient la logique métier pure, sans dépendance aux frameworks (React Native, Google, etc.).
- **Infrastructure (Adapters)** : Implémentations concrètes des interfaces (OCR, Storage, Maps). Permet de changer de fournisseur facilement.
- **Features** : Découpage par domaine fonctionnel (ex: deliveries, tracking).
- **TDD (Chicago Style)** : Tests portés sur le comportement et l'état final, garantissant une robustesse maximale lors des refactorings.

---

## 🛠️ Stack Technique

| Technologie | Usage |
|------------|-------|
| React Native / Expo | Framework Cross-platform |
| TypeScript | Typage statique pour la sécurité logicielle |
| Jest / Testing Library | Tests unitaires et d'intégration (TDD) |
| React Navigation | Gestion des flux d'écrans |
| Zustand / TanStack Query | Gestion d'état et cache (prévu) |
| WatermelonDB | Stockage SQLite performant pour le Offline (prévu) |

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
- [x] Implémentation du Repository In-Memory & Fake OCR.
- [x] Mise en place de l'UI de base (Liste des scans).
- [x] Configuration de React Navigation.
- [ ] **Prochaine étape** : Intégration de la cartographie (Google Maps/Mapbox).
- [ ] Implémentation de la persistance SQLite (Offline-First).
- [ ] Algorithme de tri de tournée.
- [ ] Module de géolocalisation en arrière-plan.

---

## 📝 Note de développement

Le projet privilégie toujours une implémentation **"Fake"** ou **"In-Memory"** testée avant de passer à l'implémentation native finale.
