# Ginko GTFS Explorer

Application web **Node.js / Express** qui lit les données ouvertes **GTFS** du réseau de bus et tram **Ginko** (Besançon). Elle expose une **API REST documentée** et affiche les lignes, les stations et les horaires de passage dans des pages générées avec **Pug**.

Projet réalisé dans le cadre du cours de développement web de L3 Informatique (semestre 5), à partir d'une base fournie par l'enseignant.

## Fonctionnalités

### Lecture des données
- Lecture en flux (`readline`) des fichiers GTFS : `routes`, `trips`, `calendar_dates`, `stop_times` et `stops`.
- Filtrage sur une liste de lignes choisies dans `.env`.
- Construction en mémoire des lignes et de leurs directions, des voyages et de leurs arrêts, des services par date, ainsi que des quais et de leurs stations parentes.

### API REST
| Route | Description |
|---|---|
| `GET /api/lignes` | Liste des lignes avec leurs directions |
| `GET /api/horaires/{ligne}/{direction}?date=AAAA-MM-JJ` | Voyages d'une ligne dans une direction pour une date |
| `GET /api/stations` | Liste des stations (sans les quais) |
| `GET /api/horaire/{station_id}?date=AAAA-MM-JJ` | Lignes, directions et horaires de passage à une station pour une date |

- Sans paramètre `date`, c'est la date du jour qui est utilisée.
- Une station inconnue ou une date mal formée renvoie une erreur **404**.
- Un identifiant de quai (ex. `HMAI1`) renvoie les horaires de sa station-mère (ex. `st_8_mai`).
- La documentation interactive **OpenAPI / Swagger** est disponible sur `/api-docs`.

### Pages web
- `/lignes` : lignes du réseau avec leurs couleurs. Un clic sur une direction affiche les horaires voyage par voyage.
- `/stations` : stations par ordre alphabétique. Un clic sur une station affiche, pour chaque ligne et direction, les horaires de la journée regroupés par heure.
- Sur les pages d'horaires, un sélecteur permet de changer de date.

## Structure

```
├── index.js              # démarrage du serveur
├── app.js                # configuration Express (Pug, middlewares, routes, Swagger, erreurs)
├── routers/              # définition des URL (pages et API)
├── controllers/          # traitement des requêtes
├── models/               # calcul des données (lignes, stations, horaires)
├── utils/gtfs-reader.js  # lecture et indexation des fichiers GTFS
├── docs/                 # génération de la documentation OpenAPI
├── middlewares/          # logger des requêtes
├── views/                # gabarits Pug
├── public/               # CSS et JavaScript côté navigateur
├── tests/                # tests de l'API (Vitest + Supertest)
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

Puis ouvrir <http://localhost:3000/stations>, <http://localhost:3000/lignes> ou <http://localhost:3000/api-docs>.

La lecture des fichiers prend quelques secondes au démarrage (`stop_times.txt` contient plus de 500 000 lignes).

## Tests

```bash
npm test
```

## Technologies

Node.js (modules ES), Express 5, Pug 3, dotenv, swagger-jsdoc, swagger-ui-express, Vitest, Supertest.
