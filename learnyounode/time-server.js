const net = require('net');
const strftime = require('strftime');

const server = net.createServer((socket) => {

    let date = new Date();

    const formatted = strftime("%Y-%m-%d %H:%M", date);

    console.log(formatted);

    socket.end(formatted + "\n");
})

server.listen(process.argv[2])
