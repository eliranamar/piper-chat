var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var users = [];
var connections = [];
var port = process.env.PORT || 8000;

app.use(express.static('public'));
app.use(express.static('node_modules'));


io.on('connection', function (socket) {
  console.log('======================');
  console.log('a user connected');
  console.log('======================');
  socket.on('chat message', function (msg) {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function () {
    console.log('======================');
    console.log('user disconnected');
    console.log('======================');
  });
})

server.listen(port, function () {
  console.log('======================');
  console.log('listening on port 8000');
  console.log('======================');
});