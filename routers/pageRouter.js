import express from 'express'; 

import { getLignes, getStations } from '../controllers/pageController.js';

const pageRouter = express.Router();

pageRouter.get("/", (req, res, next) => {
    res.status(200).send("Hello world!");
});

pageRouter.get("/lignes", getLignes);

pageRouter.get("/stations", getStations);

export default pageRouter;