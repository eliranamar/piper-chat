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
  res.sendFile(__dirname + '/public/chat.html');
});
// when a user connects
io.on('connection', function (socket) {
  function updateUserList() {
    console.log('updating on chat enter');
    socket.to(socket.room).emit('usernames', Object.keys(users));
    // socket.emit('usernames', Object.keys(users));
  }
  // app.get('/chat/:id', function (req, res) {
  //   room = req.params.id;
  //   console.log(room);
  //   res.send()
  // });

  // when user login to chat room
  socket.on('create chat room' , function(data){
    console.log(data);

  })

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
      // updateUsers();
      updateUserList();
    }
  })

  socket.on('join room', function (room) {
    socket.room = room;
    socket.join(socket.room);
    updateUserList();

  })

  //when client send a message
  socket.on('chat message', function (msg) {
    console.log(socket.username);
    //send to every one
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
    socket.leave(socket.room);
    // updateChatRoom(socket, 'diconnected')
    // updateUsers();
    updateUserList();
  });


})


function updateClient(socket, username, newRoom) {

}

// function updateChatRoom(socket, message) {
//   socket.broadcast.to(socket.room).emit('update chat', 'SERVER', socket.username + ' have ' + message);

// }