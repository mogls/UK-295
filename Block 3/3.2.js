const express = require("express");
const app = express();
const port = 8000;

app.get("/", (req, res) => {
    res.send(`Weather is at: http://localhost:${port}/temperature`);
});

app.get("/temperature", async (req, res) => {
    try {
        const response = await fetch(
            "https://app-prod-ws.meteoswiss-app.ch/v1/plzDetail?plz=818000"
        );
        if (response.ok) {
            const data = await response.json();
            // console.log(data.currentWeather.temperature);
            const currentTemp = data.currentWeather.temperature
            res.send(`Current temperature is: ${currentTemp} °C`);
        } else {
            console.log("Error!")
            res.status(500);
            res.send("Couldn't get weather data");
        }
    } catch (err) {
        console.error(err);
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
