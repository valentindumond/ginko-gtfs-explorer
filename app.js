import express from 'express';
import { routes } from './utils/gtfs-reader.js';
import pageRouter from './routers/pageRouter.js';
import logger from './middlewares/logger.js';

const app = express();

// paramétrage PUG
app.set('view engine','pug');
app.set('views','./views');

// logger (placé en premier pour capture toutes les requêtes)
app.use(logger);

// service statique de ressources issues d'un dossier de l'arborescence
app.use(express.static('public'))

// Routes servant à générer des pages PUG
app.use(pageRouter);

// Pour tester les données lues (pas demandé dans le TP)
app.get("/routes", (req, res, next) => {
    res.status(200).json(routes);
});

// Gestion des erreurs 500 (erreur interne serveur)
app.use((err, req, res, next) => { 
    res.status(500).send("Erreur interne : " + err.message); 
})

// Gestion des erreurs 404 (ressources inexistantes)
app.use((req, res, next) => { 
    res.status(404).render('404');
})

export default app;
