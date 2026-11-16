import { getRoutesAndDirections, getScheduleForRouteAndDirection, getStations, getScheduleForStation } from "../models/gtfs-model.js";


function getLignes(req, res) {
    res.status(200).json(Object.values(getRoutesAndDirections()));
}

function getHorairesParLigne(req, res) {
    const route = req.params.ligne;
    const direction = req.params.direction;
    const date = (req.query.date || new Date().toISOString().substring(0,10)).replaceAll("-","");
    const horaires = 
        getScheduleForRouteAndDirection(route, direction, date);
    if (horaires) {
        res.status(200).json(horaires);
    }
    else {
        res.status(404).json({});
    }
}

function getListeStations(req, res){
    res.status(200).json(getStations());
}

function getHorairesParStation(req, res){
    const station = req.params.station_id;
    const texte = (req.query.date || new Date().toISOString().substring(0,10));
    if(!/^\d{4}-\d{2}-\d{2}$/.test(texte)){
        return res.status(404).json({});
    }
    const date = texte.replaceAll("-","");
    const horaires = getScheduleForStation(station,date);
    if(horaires){
        res.status(200).json(horaires);
    }else{
        res.status(404).json({});
    }
}

export { getLignes, getHorairesParLigne, getListeStations, getHorairesParStation};