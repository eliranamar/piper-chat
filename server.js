var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.io = io; // attaching io instance to the app
var users = {};
var rooms = [];
var port = process.env.PORT || 8000;

app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))

server.listen(port, '0.0.0.0', function () {
  console.log('listening on port 8000');
});

//get req for chat rooms route
app.get('/chat/:id', function (req, res) {
  room = req.params.id;
  console.log(room);
  res.redirect('http://localhost:8000/chat.html?' + room);
});
// when a user connects
io.on('connection', function (socket) {
  function updateUserList() {
    console.log('updating on chat the users on room ' + socket.room);
    socket.to(socket.room).emit('usernames', Object.keys(users));
    // socket.emit('usernames', Object.keys(users));
  }

  // when user create and login to chat room
  socket.on('create chat room', function (roomId) {
    console.log(roomId);
  })

  // check if new user exists
  socket.on('new user', function (data, callback) {
    console.log(data);
    if (data in users) {
      callback(false);
    } else {
      callback(true);
      socket.room = room;
      socket.username = data;
      // users.push(socket.username);
      users[socket.username] = socket;
      // console.log(users);
      // updateUserList();
    }
  })

  //when client request to join a room
  socket.on('join room', function (room) {
    socket.room = room;
    socket.join(socket.room);
    // send only to new user they connected to room
    socket.emit('update chat', 'FROM SERVER', 'you have connected to room ' + socket.room);
    // send to chat room a new user connected
    socket.broadcast.to(socket.room).emit('update chat', 'FROM SERVER', socket.username + ' has connected to this room');
    updateUserList();
  })

  //when client send a message
  socket.on('chat message', function (msg) {
    console.log(socket.username + ': ' + msg + '. sent on room ' + socket.room);
    //send to every one in room
    io.in(socket.room).emit('chat message', {
      text: msg,
      user: socket.username
    });
  });

  // on disconnect of a user
  socket.on('disconnect', function () {
    if (!socket.username) return;
    // users.splice(users.indexOf(socket), 1);
    delete users[socket.username];
    socket.broadcast.to(socket.room).emit('update chat', 'FROM SERVER', socket.username + ' has disconnected from room ' + socket.room);
    socket.leave(socket.room);
    // updateChatRoom(socket, 'diconnected')
    // updateUsers();
    updateUserList();
  });
})