const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger Options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ophiuchus Health Monitoring API',
            version: '1.0.0',
            description: 'Backend API documentation for Ophiuchus Health Monitoring system',
        },
        servers: [
            {
                url: 'http://localhost:4000/api/v1',
                description: 'Local development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/**/*.js'], // Swagger comments path (adjust if needed)
};

// Swagger Spec Generator
const swaggerSpec = swaggerJSDoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec,
};
