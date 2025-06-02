const express = require("express");
const session = require("express-session");

require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.urlencoded());
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: true,
        saveUninitialized: false,
    })
);

app.get("/name", (req, res) => {
    if (req.session.name) {
        res.status(200).send("Your name is: " + req.session.name);
    } else {
        res.status(500).send("Name not found");
    }
});

app.post("/name", (req, res) => {
    const { name } = req.body || {};

    if (!name) {
        res.status(400).send("Name is required");
        return;
    }

    req.session.name = name;

    res.status(201).send("Name saved successfully");
});

app.delete("/name", (req, res) => {
    if (req.session.name) {
        req.session.name = undefined;
        res.status(200).send("Removed name");
    } else {
        res.status(500).send("Name not found");
    }
})


app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
})