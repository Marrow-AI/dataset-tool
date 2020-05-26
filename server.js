const express = require ('express');
const http = require("http");
const cors = require('cors');
const socket = require('socket.io');
const index = require("./index");
const port = process.env.PORT || 4000;

const app = express();
app.use(index);

const server = http.createServer(app);
const io = socket(server);

console.log("ws is running");

io.on('connection', newConnection);

function newConnection(socket) {
    console.log('new connection:' + socket.id)

    socket.on('fetch', fromAPI) 

    function fromAPI(setImages) {
      socket.emit('fromAPI', setImages)
    }
}

server.listen(port, () => console.log(`Listening on port ${port}`));
