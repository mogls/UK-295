import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Tasks",
        description: "Description",
    },
    host: "localhost:3000",
};

const outputFile = "./swagger-output.json";
const routes = ["./projekt.mjs"];

swaggerAutogen(outputFile, routes, doc);
