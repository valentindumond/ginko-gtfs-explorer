import swaggerJsdoc from 'swagger-jsdoc';

// Options de configuration pour swagger-jsdoc
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mon API Express',
      version: '1.0.0',
      description: 'Documentation interactive de mon API générée à partir des commentaires',
    }
  },
  // Chemin vers vos fichiers contenant les commentaires OpenAPI
  apis: ['./routers/*.js', './app.js'], 
};

// Initialiser le document OpenAPI
export const swaggerDocs = swaggerJsdoc(swaggerOptions);