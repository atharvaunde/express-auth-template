const swaggerAutogen = require('swagger-autogen')();
const fs = require('fs');

const doc = {
    info: {
        title: 'My API',
        description: 'Description',
    },
    host: 'localhost:3001',
};

const outputFile = './swagger-output.json';
// routers.index has different routes for different modules
const routes = ['./routers/index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
