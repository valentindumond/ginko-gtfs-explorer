import { routes, trips, stops, dates } from "../utils/gtfs-reader.js";

function getRoutesAndDirections() {
    return routes;
}

function getScheduleForRouteAndDirection(route, direction, date) {
    // format du résultat attendu { date, route_id, name, short_name, color, text_color, direction_id, headSign, trips }

    // cas d'erreur 
    if (!routes[route]) return null;
    if (!routes[route].directions[direction]) return null;

    // construction du résultat 
    const result = {
        date, 
        route_id: route,
        name: routes[route].name,
        short_name: routes[route].short_name,
        color: routes[route].color,
        text_color: routes[route].text_color,
        direction_id: direction,
        headSign: routes[route].directions[direction], 
        trips: []
    }
    // contenu du tableau trips : { trip_id, stops: [ { time, stop_id, stop_name }, {...}, ... ] }
    for (const trip_id in trips) {
        const trip = trips[trip_id];
        if (trip.route == route && trip.direction == direction && dates[date] && dates[date].indexOf(trip.service) >= 0) {
                // { arrival_time, departure_time, stop_id, sequence } --> { time, stop_id, stop_name }
                result.trips.push({ 
                    trip_id, 
                    stops: trip.stops.map(stop => { 
                        return { 
                            time: stop.arrival_time,
                            stop_id: stop.stop_id,
                            stop_name: stops[stop.stop_id].name
                        }; 
                    }).sort((st1,st2) => st1.time.localeCompare(st2.time))  // ordre chronologiques des stations 
                });
            }
    }
    result.trips.sort((t1,t2) => t1.stops[0].time.localeCompare(t2.stops[0].time)); // ordre chronologique des voyages
    return result;
}

function getStations(){
    return Object.values(stops).filter(s => s.stops);
}

function getScheduleForStation(station, date){
    if(!stops[station]) return null;
    if(stops[station].parent){
        station = stops[station].parent;
    }
    const lignes = {};
    for(const quai of stops[station].stops){
        for(const trip_id in stops[quai].trips){
            const trip = trips[trip_id];
            if(!(dates[date] && dates[date].indexOf(trip.service) >= 0)){
                continue;
            }
            const heure = stops[quai].trips[trip_id].arrival_time;
            if(!lignes[trip.route]){
                const r = routes[trip.route];
                lignes[trip.route] = {
                    id: r.id,
                    short_name: r.short_name,
                    name: r.name,
                    color: r.color,
                    text_color: r.text_color,
                    directions: {}
                };
            }
            if(!lignes[trip.route].directions[trip.direction]){
                lignes[trip.route].directions[trip.direction] = {
                    id: trip.direction,
                    headSign: routes[trip.route].directions[trip.direction],
                    times: []
                };
            }
            lignes[trip.route].directions[trip.direction].times.push(heure);
        }
    }
    for(const id in lignes){
        lignes[id].directions = Object.values(lignes[id].directions);
        for(const direction of lignes[id].directions){
            direction.times.sort((a, b) => a.localeCompare(b));
        }
    }
    return {
        date,
        id: station,
        name: stops[station].name,
        routes: Object.values(lignes)
    };
}

export { getRoutesAndDirections, getScheduleForRouteAndDirection, getStations, getScheduleForStation };