console.log('socket.js connected');


var socket = io();
var room = window.location.href.split('?')[1];
console.log('room: ' + room);

// socket.on('connect', function () {
//   // Connected, let's sign-up for to receive messages for this room
//   socket.emit('join room', id);
// });

// when client sends a message to server
$('#messageForm').submit(function () {
  //emit to server
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  // console.log('msg submitted');
  return false;
});

// when the server send a message:
socket.on('update chat', function (username, data) {
  $('#messages').append('<b>' + username + ':</b> ' + data + '<br>');
});

// when server sends a message to client
socket.on('chat message', function (data) {
  // console.log(data.user);
  $('#messages').append($('<li>').text('- ' + data.user + ': ' + data.text));
  window.scrollTo(0, document.body.scrollHeigh);
});

// grab user login elements
var $usersLogin = $('#users');
var $userForm = $('#form1');
var $nicknameInput = $('#nicknameInput');
//on user login 
$userForm.submit(function (e) {
  e.preventDefault();
  if (!room) {
    $('body').html('');
    $('body').append('<img width="100%" id="magicWord" src="https://media.giphy.com/media/uOAXDA7ZeJJzW/giphy.gif"></img>');
    return false;
  }
  console.log('submit nickname');
  console.log($nicknameInput.val());
  if (!$nicknameInput.val()) {
    alert('please enter nickname');
    return false;
  }
  socket.emit('new user', $nicknameInput.val(), function (data) {
    if (data) {
      socket.emit('join room', room);
      $(".i-am-centered").addClass("hide");
      $(".container").removeClass("hide");
    } else {
      alert('nick name taken, try something else');
    }

  });
  $nicknameInput.val('');
});

socket.on('update users', function (data) {
  console.log('updating users...');
});

socket.on('usernames', function (data) {
  // console.log('test');
  console.log(data);
  var html = '';
  for (i = 0; i < data.length; i++) {
    html += data[i] + '<br/>';
  }
  $usersLogin.html(html);
});

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text + Math.floor(Math.random() * 19568);
}

$('#nicknameInput').focus();