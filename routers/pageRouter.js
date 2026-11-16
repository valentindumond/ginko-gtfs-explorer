import express from 'express'; 

import { getLignes, getStations } from '../controllers/pageController.js';

const pageRouter = express.Router();

/**
 * GET / --> redirection vers les lignes
 */
pageRouter.get("/", (req, res) => {
    res.redirect("/lignes");
})

/**
 * GET /lignes --> affiche les lignes
 */
pageRouter.get("/lignes", getLignes);

/** 
 * GET /stations --> affiche les arrêts 
 */
pageRouter.get("/stations", getStations);

export default pageRouter;