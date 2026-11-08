import fs from "fs";
import readline from "readline";

import dotenv from "dotenv";
dotenv.config();

// affiche des infos lors de l'exÃ©cution (0:mode silencieux)
const VERBOSE = 0;

// les routes issues du fichier route.txt (Ã  remplir en lisant ce fichier)
const routes = {};
const trips = {};
const dates = {};
const stops = {};

process.env.LIGNES.split(",").forEach(id => {
    routes[id] = 1;
});

// lecture asynchrone séquentielle des routes puis des voyages
async function initialize() {
    await readFile("./data/routes.txt", readRoutes);
    await readFile("./data/trips.txt", readTrips);
    await readFile("./data/calendar_dates.txt", readDates);
    await readFile("./data/stop_times.txt", readStopTimes);
    await readFile("./data/stops.txt", readStops);
}
initialize();

// fonction qui s'applique à la lecture de chaque ligne de routes.txt
function readRoutes(line, header) {
    const route_id = line[header.route_id];
    if (!routes[route_id]) return;
    const name = line[header.route_long_name];
    const short_name = line[header.route_short_name];
    const color = line[header.route_color];
    const text_color = line[header.route_text_color];
    routes[route_id] = { route_id, name, short_name, color, text_color, directions: [] };
}

// fonction qui s'applique à la lecture de chaque ligne de trips.txt 
// objectif : compléter les directions des routes déjà existantes
function readTrips(line,header) {
    const route_id = line[header.route_id];
    if (!routes[route_id]) return;
    const trip_id = line[header.trip_id];
    const service_id = line[header.service_id];
    const headsign = line[header.trip_headsign];
    let position = routes[route_id].directions.indexOf(headsign);
    if(position === -1){
        routes[route_id].directions.push(headsign);
        position = routes[route_id].directions.length - 1;
    }
    trips[trip_id] = { id: trip_id, route: route_id, direction: position, service: service_id };
}

function readDates(line, header){
    const service_id = line[header.service_id];
    const date = line[header.date];
    if(!dates[date]){
        dates[date] = [];
    }
    dates[date].push(service_id);
}

function readStopTimes(line, header){
    const trip_id = line[header.trip_id];
    if(!trips[trip_id]) return;
    const stop_id = line[header.stop_id];
    const arrival_time = line[header.arrival_time];
    const departure_time = line[header.departure_time];
    const stop_sequence = line[header.stop_sequence];
    if(!trips[trip_id].stops){
        trips[trip_id].stops = [];
    }
    if(!stops[stop_id]){
        stops[stop_id] = { trips: {} };
    }
    trips[trip_id].stops.push({ stop_id, arrival_time, departure_time, sequence: stop_sequence });
    stops[stop_id].trips[trip_id] = { trip_id, arrival_time, departure_time, sequence: stop_sequence };
}

function readStops(line, header){
    const stop_id = line[header.stop_id];
    if(!stops[stop_id]) return;
    const nom = line[header.stop_name].replaceAll('"', '');
    const latitude = line[header.stop_lat];
    const longitude = line[header.stop_lon];
    const parent = line[header.parent_station];
    stops[stop_id].id = stop_id;
    stops[stop_id].name = nom;
    stops[stop_id].latitude = latitude;
    stops[stop_id].longitude = longitude;
    stops[stop_id].parent = parent
    if(parent){
        if(!stops[parent]){
            stops[parent] = { id: parent, name: nom, stops: [] };
        }
        stops[parent].stops.push(stop_id);
    }
}

/**
 * RÃ©alise la lecture des fichiers. On suppose que la premiÃ¨re ligne de ces fichiers 
 * contient une entete donnant l'ordre des champs.
 * @param {File} file le fichier Ã  lire
 * @param {Function} callback la fonction Ã  exÃ©cuter sur chaque ligne
 */
async function readFile(file, callback) {

    try {
        const fileStream = fs.createReadStream(file);
        
        fileStream.on('error', (err) => {
            console.error(`Error reading file: ${err.message}`);
        });
        
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let header = null;
        for await (let line of rl) {
            line = line.split(",").map(e => e.trim());
            if (!header) {
                header = {};
                line.forEach((field,idx) => header[field] = idx);
                VERBOSE && console.log(header);
            }
            else {
                VERBOSE && console.log(line);
                callback(line, header);
            }
        }
    }
    catch (err) {
        console.error("Error reading file " + file + "\n" + "Description: " + err.message);
    }
}

export { routes, trips, dates, stops };