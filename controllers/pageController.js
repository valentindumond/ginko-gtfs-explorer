import { routes, stops } from '../utils/gtfs-reader.js';

function getLignes(req, res, next) {
    res.status(200).render('lignes', { routes });
}

function getStations(req, res, next){
    const stations = Object.values(stops).filter(s => s.stops).sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).render('stations', { stations });
}

export { getLignes, getStations };