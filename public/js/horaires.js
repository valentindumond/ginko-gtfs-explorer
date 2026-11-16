document.addEventListener("DOMContentLoaded", function() {

    // Ecouteurs d'événements sur les lignes
    document.querySelectorAll("li[data-route][data-direction]").forEach(elem => elem.addEventListener("click", function(e) {
        const route = this.dataset.route;
        const direction = this.dataset.direction;
        chargerHorairesLignes(route, direction);
    }));

    // Envoi de la requête de récupération des horaires à l'API et affichage des résultats
    async function chargerHorairesLignes(route, direction, date) {
        const url = `/api/horaires/${route}/${direction}${date ? ("?date="+date) : ""}`
        const response = await fetch(url);
        if (response.status == 200) {
            const data = await response.json();
            afficherHorairesLignes(data);
        }
        else {
            alert(`Erreur avec la requête HTTP envoyée au serveur (status=${response.status})`);
        }
    }

    // Effacement de la zone centrale et affichage de
    function afficherHorairesLignes(data) {
        const main = document.querySelector("main");
        main.innerHTML = "";

        // changement du titre de la page
        document.querySelector("h1").innerHTML = "Horaires d'une ligne";

        // Titre avec le nom de la ligne et la direction
        const h2 = document.createElement("h2");
        h2.style = `color: #${data.text_color}; background-color: #${data.color}; position: relative;`;
        h2.innerHTML = `${data.short_name} - ${data.name} &nbsp;&nbsp; Direction ${data.headSign}`;
        main.appendChild(h2);

        // ajout du sélecteur de date
        const dateChooser = document.createElement("input");
        dateChooser.type = "date";
        dateChooser.style = "position: absolute; top: 10px; right: 10px;"
        dateChooser.value = `${data.date.substring(0,4)}-${data.date.substring(4,6)}-${data.date.substring(6)}`;
        dateChooser.addEventListener("change", function() {
            chargerHorairesLignes(data.route_id, data.direction_id, this.value);
        });
        h2.appendChild(dateChooser);


        // Test de l'existence d'un horaire 
        if (data.trips.length == 0) {
            const p = document.createElement("p");
            p.innerHTML = "Pas de circulation pour ce jour";
            main.appendChild(p);
            return;
        }

        // Zone de navigation entre les voyages
        const div = document.createElement("div");
        div.style = "text-align: center;";
        div.innerHTML = '<button id="btnPrec"></button>'
            + data.trips.map((_h,i) => `<label data-index="${i}"><input type="radio" name="radTrip"></label>`).join("")
            + '<button id="btnNext"></button>';
        div.addEventListener("click", function(e) {
            const selected = main.querySelector("label:has(input:checked)");
            switch (e.target.tagName) {
                case "BUTTON":
                    if (e.target.id == "btnPrec" && selected.previousElementSibling) {
                        selected.previousElementSibling.click();
                        return;
                    }
                    if (e.target.id == "btnNext" && selected.nextElementSibling) {
                        selected.nextElementSibling.click();
                        return;
                    }
                    break;
                case "LABEL":
                    afficherHoraireLigne(data, Number(e.target.dataset.index));
                    break;
            }
        });
        main.appendChild(div)
        
        // table contenant les horaires de passage aux différents arrêts
        const table = document.createElement("table");
        main.appendChild(table);

        // affichage du premier horaire (s'il existe)
        main.querySelector("label")?.click();
    }

    // affichage du tableau contenant les horaires
    function afficherHoraireLigne(data, index) {
        const table = document.querySelector("main table");
        const horaire = data.trips[index].stops;
        table.innerHTML = horaire.map(function(h) {
            const stop = h.stop_name.substring(1,h.stop_name.length-1);
            const time = h.time.split(":")
            return `<tr><td>${stop}</td><td style="width: 60px; text-align: center;">${time[0]%24}:${time[1]}</td></tr>`
        }).join("");
    }

    document.querySelectorAll("li[data-id]").forEach(elem => elem.addEventListener("click", function(e) {
        chargerHorairesStation(this.dataset.id);
    }));

    async function chargerHorairesStation(id, date) {
        const url = `/api/horaire/${id}${date ? ("?date="+date) : ""}`;
        const response = await fetch(url);
        if (response.status == 200) {
            const data = await response.json();
            afficherHorairesStation(data);
        }
        else {
            alert(`Erreur avec la requête HTTP envoyée au serveur (status=${response.status})`);
        }
    }

    function afficherHorairesStation(data) {
        const main = document.querySelector("main");
        main.innerHTML = "";

        document.querySelector("h1").innerHTML = "Horaires d'une station";

        const h2 = document.createElement("h2");
        h2.style = "position: relative;";
        h2.innerHTML = `Station ${data.name}`;
        main.appendChild(h2);

        const dateChooser = document.createElement("input");
        dateChooser.type = "date";
        dateChooser.style = "position: absolute; top: 10px; right: 10px;";
        dateChooser.value = `${data.date.substring(0,4)}-${data.date.substring(4,6)}-${data.date.substring(6)}`;
        dateChooser.addEventListener("change", function() {
            chargerHorairesStation(data.id, this.value);
        });
        h2.appendChild(dateChooser);

        if (data.routes.length == 0) {
            const p = document.createElement("p");
            p.innerHTML = "Pas de circulation pour ce jour";
            main.appendChild(p);
            return;
        }

        const table = document.createElement("table");
        table.innerHTML = data.routes.map(route =>
            `<tr><td colspan="2" style="color: #${route.text_color}; background-color: #${route.color};">${route.short_name} - ${route.name}</td></tr>`
            + route.directions.map(direction =>
                `<tr><td>${direction.headSign}</td><td><div style="display: flex; gap: 15px;">${formaterHoraires(direction.times)}</div></td></tr>`
            ).join("")
        ).join("");
        main.appendChild(table);
    }

    function formaterHoraires(times) {
        const parHeure = {};
        for (const time of times) {
            const [h, m] = time.split(":");
            if (!parHeure[h]) {
                parHeure[h] = [];
            }
            parHeure[h].push(`${Number(h) % 24}:${m}`);
        }
        return Object.keys(parHeure).sort().map(h => `<div>${parHeure[h].join("<br>")}</div>`).join("");
    }

});