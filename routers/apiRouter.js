import express from 'express'; 

import { getLignes, getHorairesParLigne, getListeStations, getHorairesParStation } from '../controllers/apiController.js';

const apiRouter = express.Router();

/**
 * @openapi
 * /api/lignes:
 *   get:
 *     tags: 
 *       - Données de transport
 *     summary: Récupère la liste des lignes avec leurs propriétés
 *     description: Renvoie un tableau d'objets donnant le détail de chaque ligne. 
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 type: object
 *                 properties: 
 *                   id: 
 *                     type: number
 *                   name: 
 *                     type: string 
 *                   short_name: 
 *                     type: string 
 *                   color: 
 *                     type: string 
 *                   text_color: 
 *                     type: string 
 *                   directions: 
 *                     type: array
 *                     items: 
 *                       type: string 
 */
apiRouter.get("/lignes", getLignes);

/**
 * @openapi
 * /api/horaires/{ligne}/{direction}:
 *   get:
 *     tags: 
 *       - Données de transport
 *     summary: Récupère les voyages du jour associés à une ligne et une direction
 *     description: Renvoie un tableau contenant les détails de chaque voyage (arrêt et horaire)
 *     parameters:
 *       - in: path
 *         name: ligne
 *         schema: 
 *           type: integer
 *         required: true
 *         description: identifiant de la ligne
 *       - in: path
 *         name: direction
 *         schema: 
 *           type: integer
 *         required: true
 *         description: indice de la direction pour la ligne considérée
 *       - in: query
 *         name: date
 *         schema: 
 *           type: string
 *         required: false
 *         description: date demandée au format AAAA-MM-JJ
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: 
 *                 date:
 *                   type: string
 *                 route_id: 
 *                   type: string
 *                 name: 
 *                   type: string
 *                 short_name: 
 *                   type: string
 *                 color: 
 *                   type: string
 *                 text_color: 
 *                   type: string
 *                 direction_id:  
 *                   type: string
 *                 headSign:   
 *                   type: string
 *                 trips: 
 *                   type: array
 *                   items: 
 *                     type: object
 *                     properties:
 *                       trip_id: 
 *                         type: string
 *                       stops: 
 *                         type: array
 *                         items: 
 *                           type: object
 *                           properties: 
 *                             stop_id: 
 *                               type: string
 *                             stop_name: 
 *                               type: string
 *                             time: 
 *                               type: string
 *       404:
 *         description: Erreur dans les paramètres
 */
apiRouter.get("/horaires/:ligne/:direction", getHorairesParLigne);

/**
 * @openapi
 * /api/stations:
 *   get:
 *     tags: 
 *       - Données de transport
 *     summary: Récupère la liste des stations du réseau
 *     description: Renvoie un tableau contenant toutes les stations (stations-mères uniquement, sans les quais qui les composent).
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 type: object
 *                 properties: 
 *                   id: 
 *                     type: string
 *                   name: 
 *                     type: string
 *                   stops: 
 *                     type: array
 *                     description: identifiants des quais de la station
 *                     items: 
 *                       type: string
 *                   parent: 
 *                     type: string
 *                     nullable: true
 */
apiRouter.get("/stations",getListeStations);

/**
 * @openapi
 * /api/horaire/{station_id}:
 *   get:
 *     tags: 
 *       - Données de transport
 *     summary: Récupère les horaires de passage à une station pour une date donnée
 *     description: Renvoie, pour la station (ou la station-mère du quai indiqué), les lignes et directions qui la desservent, avec les horaires de passage de la journée.
 *     parameters:
 *       - in: path
 *         name: station_id
 *         schema: 
 *           type: string
 *         required: true
 *         description: identifiant de la station (ex. st_8_mai) ou d'un de ses quais (ex. HMAI1)
 *       - in: query
 *         name: date
 *         schema: 
 *           type: string
 *         required: false
 *         description: date demandée au format AAAA-MM-JJ (par défaut, la date du jour)
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: 
 *                 date:
 *                   type: string
 *                 id: 
 *                   type: string
 *                 name: 
 *                   type: string
 *                 routes: 
 *                   type: array
 *                   items: 
 *                     type: object
 *                     properties:
 *                       id: 
 *                         type: string
 *                       short_name: 
 *                         type: string
 *                       name: 
 *                         type: string
 *                       color: 
 *                         type: string
 *                       text_color: 
 *                         type: string
 *                       directions: 
 *                         type: array
 *                         items: 
 *                           type: object
 *                           properties: 
 *                             id: 
 *                               type: integer
 *                             headSign: 
 *                               type: string
 *                             times: 
 *                               type: array
 *                               items: 
 *                                 type: string
 *       404:
 *         description: Erreur dans les paramètres (station inexistante ou date erronée)
 */
apiRouter.get("/horaire/:station_id", getHorairesParStation);

export default apiRouter;