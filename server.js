const express = require ('express');
const http = require('http');
const cors = require('cors');
const axios = require('axios');
const socketIo = require('socket.io');
const index = require('./index');
const port = process.env.PORT || 4000;
const URL ='https://randomuser.me/api/?page=3&results=5&seed=abc';

const app = express();
app.use(index);

const server = http.createServer(app);
const io = socketIo(server);
console.log('ws is running');


io.on('connection', newConnection);

function newConnection(socket) {
    console.log('new connection:' + socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:' + socket.id);
    })

    //interval = setInterval(() => getApiAndEmit(socket), 1000);
    
    socket.on('fetch', (msg) => getApiAndEmit(msg, socket));

    socket.on('fetch', input)
    function input(data) {
        console.log(data)
    }
}

const getApiAndEmit = (msg, socket) => {
  axios.get(URL)
  .then(result => { 
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= result.data.results.length) {
        clearInterval(interval);
      } else {
        console.log('sending data: ', idx);
        socket.emit("getApiAndEmit", result.data.results[idx]);
        idx += 1;
      }
    }, 1000);
     })
  .catch(err => {
    console.log('Error fetching images');
  })
};



server.listen(port, () => console.log(`Listening on port ${port}`));
