
// Logger affichant dans la console les requêtes reçues par le serveur
function logger(req, res, next) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();     // <-- très important !
}

export default logger ;