console.log('socket.js connected');


var socket = io();

// when client sends a message to server
$('#messageForm').submit(function () {
  socket.emit('chat message', $('#m').val());
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
  $(".i-am-centered").addClass("hide");
  $(".container").removeClass("hide");
  socket.emit('new user', $nicknameInput.val(), function () {

  });
  $nicknameInput.val('');
});