const http = require("http");
const bl = require('bl');

const url = process.argv[2];

http.get(url, (res) => {
    res.setEncoding('utf8');

    let allData = [];

    res.on('data', (data) => {
        allData.push(data);
        // console.log(data);
    });
    res.on('error', console.error);

    res.on('end', () => {
        const fullString = allData.join("")
        console.log(fullString.length);
        console.log(fullString);
    })
})

http.get(url, (res) => {
    res.pipe(bl((err, data) => {
        if (err) throw Error("Error piping data");
        data = data.toString();
        console.log(data.length);
        console.log(data);
    }))
})

