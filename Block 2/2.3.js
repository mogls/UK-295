function simuliereVerzoegerung(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function addiereNachVerzoegerung(a, b, ms) {
    await simuliereVerzoegerung(ms);
    console.log("Das Ergebnis ist: ", a + b);
    // return a + b;
}

addiereNachVerzoegerung(2, 7, 3000)