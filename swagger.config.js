const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// 1. Buniyadi Maloomat (Metadata)
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Pharmacy Backend API',
      version: '1.0.0',
      description: 'Yeh E-Pharmacy project ki tamam backend APIs ki documentation hai.',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Aapka development server
        description: 'Development Server'
      }
    ],
    components: { // Security ke liye zaroori
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [{
        bearerAuth: []
    }]
  },
  // 2. Kahan se documentation parhni hai (API routes)
  apis: ['./src/routes/*.js'], // './src/routes' folder ki saari .js files
};

// 3. Swagger specs generate karna
const swaggerSpec = swaggerJSDoc(options);

// 4. Function jo app.js mein istemal hoga
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;