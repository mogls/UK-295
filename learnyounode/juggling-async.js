const http = require('http');
const bl = require('bl');

const urls = [2,3,4].map(i => process.argv[i]);

let output = {};

const getWrapper = (url, index) => {

    http.get(url, (res) => {
        res.pipe(bl((err, data) => {
            if (err) throw Error("Error piping data");
            output[index] = data.toString();
        }))

        res.on('end', () => {
            if (Object.keys(output).length == urls.length) {
                for (let i = 0; i < urls.length; i++) {
                    console.log(output[i]);
                }
            }
        })

    })

}

for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    getWrapper(url, i);
}

