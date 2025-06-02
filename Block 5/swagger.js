const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: "Library",
        description: 'Description',
    },
    host: 'localhost:3000',
};

const outputFile = './swagger-output.json';
const routes = ['./5.js'];

swaggerAutogen(outputFile, routes, doc)
