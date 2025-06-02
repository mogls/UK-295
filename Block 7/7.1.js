const express = require("express");

require('dotenv').config();

const {USER, PASSWORD} = process.env;

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded());

app.get("/public", (req, res) => {
    res.send("Hello public user");
});

app.get("/private", (req, res) => {
    const { username, password } = req.body || {};

    if (username === USER && password === PASSWORD) {
        res.status(200).send("Hello VIP");
    } else {
        res.sendStatus(401);
    }
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
