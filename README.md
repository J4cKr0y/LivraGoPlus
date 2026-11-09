# 📦 LivraGoPlus

LivraGoPlus est une application mobile robuste conçue pour les chauffeurs-livreurs. 
Elle simplifie la gestion des tournées grâce à l'OCR, l'optimisation de trajet et l'automatisation des notifications clients, le tout avec une approche **Offline-First**.

---

## 🚀 Vision du Projet

L'objectif est d'offrir un outil fiable qui fonctionne même dans les zones blanches (zones sans réseau) :

- **Scan & Go** : Extraction d'adresses via OCR (MLKit) avec support de saisie manuelle et galerie.
- **Offline-First** : Persistance locale sécurisée via SQLite (`Expo-SQLite` + `expo-secure-store`) avec synchronisation asynchrone en arrière-plan.
- **Optimisation de Tournée** : Algorithmes de tri et calculs de distance pour réduire les kilomètres parcourus.
- **Cloud Sync (Batch & Unitaire)** : Synchronisation par lots optimisée vers Convex pour les données et le stockage des preuves de livraison (photos).
- **Proximité Intelligente** : Envoi automatique de SMS et guidage GPS multi-applications (Waze, Google Maps, Apple Maps).

---

## 🏗️ Architecture & Principes

Le projet suit une **Architecture Hexagonale (Ports & Adapters)** découplée par **Features** :

- **Core (Domain / Services / DI)** : Contient la logique métier pure et les contrats d'interfaces (`IBackendService`, `IDeliveryRepository`), totalement indépendants des frameworks.
- **Infrastructure (Adapters)** : Implémentations techniques concrètes (SQLite, MLKit OCR, Expo Geocoding, BatchConvexBackendService). Permet de basculer d'une techno à une autre ou d'un mode unitaire à un mode batch de manière transparente.
- **Features** : Découpage fonctionnel (gestion des livraisons, store Zustand, écrans).
- **Synchronisation Offline-First** : Orchestrée par le `SyncService` et pilotée par l'état réseau (`NetInfo`), garantissant qu'aucune validation de livraison ne se perde en zone blanche.
- **TDD (Test-Driven Development)** : Tests portés sur le comportement et l'état final (Jest & React Native Testing Library), garantissant une robustesse maximale.

---

## 🛠️ Stack Technique

| Technologie | Usage |
|------------|-------|
| React Native / Expo | Framework Cross-platform |
| TypeScript | Typage statique strict |
| Jest / Testing Library | Tests unitaires et d'intégration (TDD) |
| SQLite (Expo) & SecureStore | Persistance chiffrée Offline et cache local |
| Convex (HTTP Router) | Backend Cloud (DB, Endpoints de Synchro par lots, Storage) |
| React Navigation | Gestion des flux d'écrans |
| Zustand | Gestion d'état global et UI Optimiste |

---

## 📂 Structure du code

```text
src/
├── core/               # Le Cœur (Logique métier pure)
│   ├── backend/        # Contrat IBackendService
│   ├── domain/         # Entités (Delivery, Address)
│   ├── interfaces/     # Contrats de stockage et services externes
│   ├── routing/        # Moteurs d'optimisation de tournée
│   ├── services/       # Use Cases (DeliveryService, SyncService)
│   └── di/             # Injection de dépendances (AppDependencies.ts)
├── infrastructure/     # Implémentations techniques (Adapters)
│   ├── storage/        # SQLiteDeliveryRepository & Security
│   ├── ocr/            # MLKit, FakeOCR
│   ├── map/            # ReactNativeMapService
│   ├── geocoding/      # ExpoGeocodingService
│   └── backend/        # BatchConvexBackendService
├── features/           # Écrans, stores et composants par fonctionnalité
│   └── deliveries/     # Écrans (List, Detail, Scan, Map) & useDeliveryStore
├── navigation/         # Configuration des routes (AppNavigator)
└── convex/             # Backend Convex (schéma, mutations, routes de synchro batch)
```

---

## 🛠️ Installation & Tests

### 1. Installation des dépendances

```bash
npm install
```

### 2. Lancer les tests (TDD)

```bash
npm test          # Lancer toute la suite de tests (SQLite, Services, Écrans)
npm test --watch  # Mode développement interactif
```

---

## 🗺️ Roadmap de développement

- [x] Initialisation de l'architecture Core/Domain & Ports/Adapters.
- [x] Implémentation du Scan OCR et flux de validation (Plan A, B, C).
- [x] Gestion d'état avec Zustand et UI Optimiste.
- [x] Persistance SQLite Offline-First chiffrée.
- [x] Moteur de synchronisation arrière-plan (`SyncService` & Batch Sync).
- [x] Intégration du Storage et des routes HTTP Convex.
- [x] Suite de tests unitaires et d'intégration entièrement au vert.
- [ ] Cartographie avancée et géolocalisation en arrière-plan.