import { stops } from '../utils/gtfs-reader.js';

import { getRoutesAndDirections } from '../models/gtfs-model.js';

function getLignes(req, res, next) {
    res.status(200).render('lignes', { routes: getRoutesAndDirections(), titre: "Lignes du réseau" });
}

function getStations(req, res) {
    res.render("stations", { stops, titre: "Noms des stations du réseau" });
}

export { getLignes, getStations };