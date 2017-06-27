var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var users = [];
var connections = [];
var rooms = ['room1', 'room2'];
var port = process.env.PORT || 8000;

app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))
//get req for chat rooms route
app.get('/:id/chat', function () {

});
// when a user connects
io.on('connection', function (socket) {
  console.log('======================');
  console.log('a user connected');
  console.log('======================');
  connections.push(socket);
  console.log('%s online connections', connections.length);

  // when user login to chat room
  socket.on('new user', function (data, callback) {
    console.log(data);
    callback(true);
    socket.username = data;
    users.push(socket.username);
    console.log(users);
  })

  //when client send a message
  socket.on('chat message', function (msg) {
    console.log(socket.username);
    //send to every one
    io.emit('chat message', {
      text: msg,
      user: socket.username
    });
  });

  // on disconnect of a user
  socket.on('disconnect', function () {
    console.log('======================');
    console.log('user disconnected');
    console.log('======================');
    connections.splice(connections.indexOf(socket), 1);
    console.log('%s online connections', connections.length);
  });
})

server.listen(port, '0.0.0.0', function () {
  console.log('======================');
  console.log('listening on port 8000');
  console.log('======================');
});