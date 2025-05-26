const verdoppeln = (zahl, callback) => {
    zahl *= 2;
    callback(zahl);
}

verdoppeln(8, (ergebnis) => {
    console.log("Das ergebnis ist: ", ergebnis)
})