var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var users = [];
var connections = [];
var rooms = [];
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
  // when user login to chat room
  socket.on('new user', function (data, callback) {
    if (users.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.username = data;
      users.push(socket.username);
      updateUserList();
    }
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

  // update users list
  function updateUserList() {
    io.sockets.emit('usernames', users);
  }

  // on disconnect of a user
  socket.on('disconnect', function () {
    console.log('======================');
    console.log('user disconnected');
    console.log('======================');
    users.splice(users.indexOf(socket.username), 1);
    updateUserList();
    connections.splice(connections.indexOf(socket), 1);
    console.log('%s online connections', connections.length);
  });
})

server.listen(port, '0.0.0.0', function () {
  console.log('======================');
  console.log('listening on port 8000');
  console.log('======================');
});
// Rami Routing
var myLogger = function (req, res, next) {
  console.log('LOGGED')

}
app.post('/', function (req, res) {
  myLogger();
  console.log(req.body);
  res.send(req.body);
})

app.get('/chat/:id', function (req, res) {
  myLogger();
  console.log(req.body);
  res.send("req.body");
})

console.log('socket.js connected');


var socket = io();
$('#messageForm').submit(function () {
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  console.log('msg submitted');
  return false;
});
socket.on('chat message', function (data) {
  console.log(data.user);
  $('#messages').append($('<li>').text('- ' + data.user + ': ' + data.text));
  window.scrollTo(0, document.body.scrollHeigh);
});

var $usersLogin = $('#users');
var $userForm = $('#userForm');
var $nicknameInput = $('#nicknameInput');
//on user login 
$userForm.submit(function (e) {
  e.preventDefault();

  console.log('submit nickname');
  console.log($nicknameInput.val());
  if (!$nicknameInput.val()) {
    alert('please enter nickname');
    return false;
  }

  socket.emit('new user', $nicknameInput.val(), function (data) {
    if (data) {
      $(".i-am-centered").addClass("hide");
      $(".container").removeClass("hide");
    } else {
      alert('nick name exist');
    }
  });
  $nicknameInput.val('');
});
//Rami get data of users
socket.on('usernames', function (data) {
  var html = '';
  for (i = 0; i < data.length; i++) {
    html += data[i] + '<br/>';
  }
  $usersLogin.html(html);
});
// Rami trying work on ajax
$("#createChatButton").on('click', function () {
  var id = makeid();
  console.log(id);
  createChat({
    id: id
  });
})
var createChat = function (newChat) {
  $.ajax('/chat/' + newChat.id, {
    type: "GET",
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(newChat),
    success: function (data) {
      console.log(data);
      window.location = "http://localhost:8000/" + 'chat/' + newChat.id;
      // console.log(posts);

    },
  });
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text + Math.floor(Math.random() * 19568);
}