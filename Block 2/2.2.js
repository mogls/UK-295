const fs = require("fs");

function leseDateiInhalt(filepath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, "utf8", (err, data) => {
            if (err) reject("Error reading file");
            resolve(data);
        });
    });
}

leseDateiInhalt("2.2.js")
    .then((inhalt) => {
        console.log("inhalt lange: ", inhalt.length);
    })
    .catch((err) => {
        console.error("Fehler beim lesen der Datei: ", err);
    });
