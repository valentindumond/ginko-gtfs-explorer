# Ginko GTFS Explorer

Petit serveur web **Node.js / Express** qui lit les données ouvertes **GTFS** du réseau de bus et tram **Ginko** (Besançon) et les affiche sous forme de pages HTML générées avec **Pug**.

Projet réalisé dans le cadre du cours de développement web de L3 Informatique (semestre 5), à partir d'une base fournie par l'enseignant.

## Fonctionnalités

- Lecture en flux (`readline`) des fichiers GTFS : `routes`, `trips`, `calendar_dates`, `stop_times` et `stops`.
- Filtrage sur une liste de lignes choisies dans `.env`.
- Construction en mémoire :
  - des **lignes** avec leurs directions ;
  - des **voyages** (`trips`) avec leurs arrêts et horaires ;
  - des **services par date** (`dates`) ;
  - des **arrêts** (quais) et de leurs **stations** parentes, avec coordonnées GPS.
- Pages :
  - `/lignes` : liste des lignes du réseau avec leurs couleurs et leurs directions ;
  - `/stations` : liste des stations par ordre alphabétique ;
  - `/routes` : données des lignes au format JSON.

## Structure

```
├── index.js              # démarrage du serveur
├── app.js                # configuration Express (Pug, middlewares, routes, erreurs)
├── routers/              # définition des URL
├── controllers/          # préparation des données pour les vues
├── middlewares/          # logger des requêtes
├── utils/gtfs-reader.js  # lecture et indexation des fichiers GTFS
├── views/                # gabarits Pug
├── public/               # CSS
└── data/                 # fichiers GTFS (non versionnés)
```

## Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Créer le fichier de configuration :
   ```bash
   cp .env.example .env
   ```
3. Télécharger les données GTFS du réseau Ginko (sur [transport.data.gouv.fr](https://transport.data.gouv.fr), en cherchant « Ginko »), puis décompresser les fichiers `.txt` dans le dossier `data/`.

## Lancement

```bash
npm run dev
```

Puis ouvrir <http://localhost:3000/stations> ou <http://localhost:3000/lignes>.

La lecture des fichiers prend quelques secondes au démarrage (`stop_times.txt` contient plus de 500 000 lignes).

## Technologies

Node.js (modules ES), Express 5, Pug 3, dotenv.
