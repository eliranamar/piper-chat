console.log('socket.js connected');


var socket = io();
var room = window.location.href.split('?')[1];
console.log('room: ' + room);

// socket.on('connect', function () {
//   // Connected, let's sign-up for to receive messages for this room
//   socket.emit('join room', id);
// });

// copy chat room link to clipboard
function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  console.log($temp.val());
  document.execCommand("copy");
  $temp.remove();
}


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
  socket.emit('get user list');
});

// when server sends a message to client
socket.on('chat message', function (data) {
  var text = "<li class='messageLi'><span class='nameChat' >" + data.user + '</span>' + "<p class='textChat'>" + data.text + "</p></li><div class='clearfix'></div>";
  // console.log(text);
  $('#messages').append(text);
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
    $('body').append('<img width="100%" id="magicWord" src="https://media.giphy.com/media/uOAXDA7ZeJJzW/giphy.gif"></img>' +
      '<audio src="sound/magic-word.mp3" autoplay loop></audio>');
    return false;
  }
  console.log('submit nickname');
  console.log($nicknameInput.val());
  if (!$nicknameInput.val()) {
    alert('please enter nickname');
    return false;
  }
  socket.emit('new user', {
    name: $nicknameInput.val(),
    room: room
  }, function (data) {
    if (data) {
      console.log(room);
      socket.emit('join room', room);
      $(".i-am-centered").addClass("hide");
      $(".container").removeClass("hide");
    } else {
      alert('nick name taken, try something else');
    }

  });
  $nicknameInput.val('');
  $('.infoDiv ').addClass('hide'); // Adding hide class to info to make it desapear
  $(".logoDiv").after("<div class='soundImage'><img class='img-responsive' src='/images/radar.gif'></div>");
});

socket.on('update users', function (data) {
  console.log('updating users...');
});

socket.on('usernames', function (data) {
  // console.log('test');
  console.log(data);
  var html = '';
  for (i = 0; i < data.length; i++) {
    html += "&nbsp&nbsp<img src='images/sound.gif'> " + data[i] + "<br/>";
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
$('#chat-link').append('<span id="link-text">http://localhost:8000/chat.html?' + room + '</span>');
$('#copy-link').on('click', function () {
  copyToClipboard('#link-text')
});
$('#nicknameInput').focus();