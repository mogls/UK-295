const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const port = 8080;
const upload = multer();

let randomNames = [
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

let me = {
    vorname: "Miguel",
    nachname: "Seara",
    alter: "17",
    wohnort: "Dietikon",
    augenfarbe: "Blau",
};

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded());

app.get("/now", (req, res) => {
    const { tz } = req.query;

    const time = new Date().toLocaleTimeString("de-DE", { timeZone: tz });

    console.log(tz);
    console.log(time);

    res.send(time);
});

app.get("/zli", (req, res) => {
    res.redirect("https://www.zli.ch");
});

app.get("/name", (req, res) => {
    const index = Math.floor(Math.random() * 1000) % randomNames.length;

    res.send(randomNames[index]);
});

app.get("/allnames", (req, res) => {
    console.log(randomNames);

    res.send(randomNames);
});

app.post("/name", upload.none(), (req, res) => {
    const { name } = req.body;
    console.log(req.body);

    randomNames.push(name);

    res.status(200).send("Ok");
});

app.delete("/name", (req, res) => {
    const { name: toDelete } = req.query;

    randomNames = randomNames.filter((name) => name.toLowerCase() !== toDelete.toLowerCase());

    res.status(204).send(`${toDelete} deleted`);
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

app.get("/secret2", (req, res) => {
    const auth = req.headers.authorization;

    const code = "Basic aGFja2VyOjEyMzQ=";

    if (auth === code) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.get("/secret3", (req, res) => {
    const auth = req.headers.authorization;

    if (auth.split(" ")[0] !== "Basic") {
        res.sendStatus(401);
        return;
    };

    const [username, password] = atob(auth.split(" ")[1]).split(":");

    if (username == "hacker" && password == "1234") {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.get("/xml", (req, res) => {
    const filepath = path.join(__dirname, "public", "data.xml");

    res.set("Content-Type", "application/xml");

    fs.readFile(filepath, "utf8", (err, data) => {
        if (!err) {
            res.send(data);
        } else {
            res.status(500).send("Error reading xml file");
        }
    });
});

app.get("/me", (req, res) => {
    res.json();
});

app.patch("/me", (req, res) => {
    const body = req.body;
    me = {...me, ...body};

    console.log(body);
    console.log(me);

    res.sendStatus(200);
});

app.get("/chuck", async (req, res) => {
    const name = req.query.name ?? "Chuck Noriss";
    const url = "https://api.chucknorris.io/jokes/random";

    try {
        const response = await fetch(url);
        const data = await response.json();

        const joke = "" + data.value;
        const replacedJoke = joke.replace("Chuck Norris", name);

        res.status(200).send(replacedJoke);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
