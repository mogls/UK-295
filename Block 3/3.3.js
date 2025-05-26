const express = require("express");
const strftime = require("strftime");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 8080;

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/images", express.static(path.join(__dirname, "public")));

app.get("/now", (req, res) => {
    res.send(strftime("%H h %M m %S s", new Date()));
});

app.get("/zli", (req, res) => {
    res.redirect("https://www.zli.ch");
});

app.get("/name", (req, res) => {
    const randomNames = [
        "Emerson",
        "Bernice",
        "Alice",
        "Lucinda",
        "Gillian",
        "Mae",
        "Ellison",
        "Thomas",
        "Claudia",
        "Fernando",
        "Marcella",
        "Damien",
        "Jae",
        "Syllable",
        "Cody",
        "Meaghan",
        "Vincent",
        "Drew",
        "Raine",
        "Naomi",
    ];

    const index = Math.floor(Math.random() * 100) % randomNames.length;

    res.send(randomNames[index]);
});

app.get("/html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/image", (req, res) => {
    res.send('<img src="/images/donut.jpg" alt="My Image">');
});

app.get("/teapot", (req, res) => {
    res.status(418);
    res.sendStatus(418);
});

app.get("/user-agent", (req, res) => {
    res.send(req.headers["user-agent"]);
});

app.get("/secret", (req, res) => {
    res.status(403);
    res.sendStatus(403);
});

app.get("/xml", (req, res) => {
    const filepath = path.join(__dirname, "public", "data.xml");

    res.set('Content-Type', 'application/xml');

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (!err) {
            res.send(data);
        } else {
            res.status(500).send("Error reading xml file");
        }
    })

});


app.get("/me", (req, res) => {
    res.json({
        vorname: "Miguel",
        nachname: "Seara",
        alter: "17",
        wohnort: "Dietikon",
        augenfarbe: "Blau",
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
