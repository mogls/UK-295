const fs = require('fs');
// const path = require('path') other option using path and path.extname(file)

const dir = process.argv[2];
const extensionFilter = process.argv[3];

fs.readdir(dir, {withFileTypes: true, encoding: 'utf8'}, (err, files) => {
    if (err) throw Error("Error reading directory");

    files.forEach(file => {
        const name = file.name.split(".");
        if (name.length == 1) return;
        const extension = name[name.length - 1];

        if (extension == extensionFilter) {
            console.log(file.name)
        }

    });
    

})