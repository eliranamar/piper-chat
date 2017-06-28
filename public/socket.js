console.log('socket.js connected');


var socket = io();

var room;

socket.on('connect', function () {
  // Connected, let's sign-up for to receive messages for this room
  socket.emit('join room', 'room1');
});

// eliran ajax request for joining random room
var joinRoom = function (id) {
  $.ajax('/chat/' + id, {
    type: "GET",
    success: function (data) {
      console.log(data);

    }
  });
}

// when client sends a message to server

$('#messageForm').submit(function () {
  socket.emit('chat message', $('#m').val(), function (data) {

  });
  $('#m').val('');
  console.log('msg submitted');
  return false;
});

// when server sends a message to client
socket.on('chat message', function (data) {
  console.log(data.user);
  $('#messages').append($('<li>').text('- ' + data.user + ': ' + data.text));
  window.scrollTo(0, document.body.scrollHeigh);
});

// grab user login elements
var $usersLogin = $('#users');
var $userForm = $('#userForm');
var $nicknameInput = $('#nicknameInput');
//on user login 
$userForm.submit(function (e) {
  e.preventDefault();
  room = $('input[name=roomNumber]:checked').val();
  socket.emit('join room', room);
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
      alert('user name taken, try something else');
    }
  });
  $nicknameInput.val('');
});

socket.on('update users', function (data) {
  console.log('updating users...');
});

socket.on('usernames', function (data) {
  console.log('test');
  console.log(data);
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
  joinRoom(id);
  // createChat({
  //   id: id
  // });
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