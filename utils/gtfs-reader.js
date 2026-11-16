import fs from "fs";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const VERBOSE = 0;

const filter = process.env.LIGNES.split(",").map(e => e.trim());

// lignes, indexées sur les routes_id
const routes = {};
for (let r of filter) { 
    routes[r] = {} 
};
// voyages, indexés sur les trip_id
const trips = {};
// calendrier indexé sur les dates -> Array(service_id)
const dates = {};
// arrêts (quais ou stations) indexés sur les station_id
const stops = {};



/**
 * Initialise la lecture des fichiers nécessaires. 
 */
async function initialize() {
    await readFile("./data/routes.txt", readRoute);    
    console.log(`Read ${Object.keys(routes).length} routes`);
    await readFile("./data/trips.txt", readTrips);    
    console.log(`Read ${Object.keys(trips).length} trips`);
    await readFile("./data/calendar_dates.txt", readCalendarDates);    
    console.log(`Read ${Object.keys(dates).length} dates`);
    await readFile("./data/stop_times.txt", readStopTimes);
    await readFile("./data/stops.txt", readStops);
    console.log(`Read ${Object.keys(stops).length} stops`);
};

await initialize();

/**
 * Réalise la lecture des fichiers. On suppose que la première ligne de ces fichiers 
 * contient une entete donnant l'ordre des champs.
 * @param {File} file le fichier à lire
 * @param {Function} callback la fonction à exécuter sur chaque ligne
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


//--- TRAITEMENT DE LECTURE ---//

/**
 * Traitement réalisé à la lecture de chaque ligne. 
 * Chaque ligne est transformée en objet { short_name, name, color, text_color }
 * @param {Array<string>} line la ligne qui est lue
 * @param {Object} header le tableau des entêtes associant le nom du champ à son index dans la ligne
 */
function readRoute(line, header) {
    if (routes[line[header.route_id]] !== undefined) {
        const l = routes[line[header.route_id]];
        l.id            = line[header.route_id];
        l.short_name    = line[header.route_short_name];
        l.name          = line[header.route_long_name];
        l.color         = line[header.route_color];
        l.text_color    = line[header.route_text_color];
        l.directions    = [];
    }
}

/**
 * Traitement réalisé à la lecture de chaque voyage. 
 * Chaque voyage est transformé en objet { route, direction, stops (vide) }
 * @param {Array<string>} line la ligne qui est lue
 * @param {Object} header le tableau des entêtes associant le nom du champ à son index dans la ligne
 */
function readTrips(line, header) {
    const route_id = line[header.route_id];
    // filtre les trips qui ne concernent pas les routes qui sont connues
    if (routes[route_id] === undefined) return;
    let dirHeadSign = line[header.trip_headsign];
    // cas où les champs de directions (optionnels) sont vides --> on créé une direction unique
    if (dirHeadSign.trim().length == 0) {
        dirIdx = dirHeadSign = "(only direction)";
    }
    // identification de la direction si elle existe déjà ou création si elle n'existe pas encore
    let idx = routes[route_id].directions.indexOf(dirHeadSign);
    if (idx < 0) {
        idx = routes[route_id].directions.length;
        routes[route_id].directions.push(dirHeadSign);
    }
    const service_id = line[header.service_id];
    const trip_id = line[header.trip_id];
    // création du voyage 
    trips[trip_id] = { id: trip_id, route: route_id, direction: idx, service: service_id, stops: [] }
}

/**
 * Traitement réalisé à la lecture de chaque date du calendrier. 
 * Chaque date est associée à un tableau d'identifiants de services qui circulent à cette date.
 * @param {Array<string>} line la ligne qui est lue
 * @param {Object} header le tableau des entêtes associant le nom du champ à son index dans la ligne
 */
function readCalendarDates(line, header) {
    // identification du service 
    const service_id = line[header.service_id];
    // extraction de la date
    const date = line[header.date];
    // si première occurrence de la date, on la créé
    if (!dates[date]) {
        dates[date] = [];
    }
    // ajout du service à la date
    dates[date].push(service_id);
}

/**
 * Traitement réalisé à la lecture de chaque horaire de passage à un arrêt.
 * Les informations liées au voyage associé sont complétées. Les informations liées aux arrêts sont initialisées.
 * @param {Array<string>} line la ligne qui est lue
 * @param {Object} header le tableau des entêtes associant le nom du champ à son index dans la ligne
 */
function readStopTimes(line, header) {
    const trip_id = line[header.trip_id];
    // si le voyage n'est pas relié aux lignes qui nous intéressent --> on l'oublie
    if (trips[trip_id] === undefined) return;
    const stop_id = line[header.stop_id];
    const sequence = line[header.stop_sequence];
    const arrival_time = line[header.arrival_time];
    const departure_time = line[header.departure_time];
    trips[trip_id].stops.push({ stop_id, arrival_time, departure_time, sequence });
    // peuplement des arrêts
    if (! stops[stop_id]) {
        stops[stop_id] = { trips: {} };
    }
    stops[stop_id].trips[trip_id] = { trip_id, arrival_time, departure_time, sequence };
}

/**
 * Traitement réalisé à la lecture de chaque arrêt.
 * Les informations liées aux arrêts (quais) sont complétées. On construira également les arrêts aux stations parentes. 
 * @param {Array<string>} line la ligne qui est lue
 * @param {Object} header le tableau des entêtes associant le nom du champ à son index dans la ligne
 */
function readStops(line, header) {
    const stop_id = line[header.stop_id];
    if (stops[stop_id] === undefined) return;
    stops[stop_id].id = stop_id;
    stops[stop_id].name = line[header.stop_name];
    stops[stop_id].parent = (line[header.parent_station].length > 0) ? line[header.parent_station] : null;
    // traitement des stations 
    const parent = stops[stop_id].parent;
    if (parent) {
        stops[stop_id].lat = line[header.stop_lat];
        stops[stop_id].lon = line[header.stop_lon];
        if (!stops[parent]) {
            stops[parent] = { id: parent, name: line[header.stop_name], stops: [ stop_id ] };
        }
        else {
            stops[parent].stops.push(stop_id);   
        }
    }
}

export { routes, stops, trips, dates };